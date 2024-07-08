import { Autocomplete, Box, MenuItem, Select, Button, TextField, IconButton } from '@mui/material';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { NumericFormat } from 'react-number-format';
import { Create, useAutocomplete } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import axios from '../../../axios.ts';
import { useParams } from 'react-router-dom';

export const ProductEdit = () => {
  const {
    saveButtonProps,
    refineCore: { queryResult, formLoading, onFinish },
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({});

  const { id } = useParams();

  const [attributeValues, setAttributeValues] = useState([
    { nameKZ: '', nameRU: '', nameEN: '', id: '' },
  ]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [photos, setPhotos] = useState();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const handleExpandedItemsChange = (event: React.SyntheticEvent, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    setExpandedItems((oldExpanded) =>
      oldExpanded.length === 0 ? getAllCategoryIds(transformedTree) : [],
    );
  };

  const handleAttributeValueChange = (index, field, value, id) => {
    const newAttributeValues = [...attributeValues];
    newAttributeValues[index] = {
      ...newAttributeValues[index],
      [field]: value,
      id: id,
    };
    setAttributeValues(newAttributeValues);
  };

  const { autocompleteProps: categoryAutocompleteProps } = useAutocomplete({
    resource: 'categories',
  });

  const useCategoryAutocomplete = (id) => {
    const { autocompleteProps } = useAutocomplete({
      resource: id ? `categories/${id}` : null,
    });

    return { autocompleteProps: autocompleteProps ?? {} };
  };

  const { autocompleteProps: categoryIdAutocompleteProps } =
    useCategoryAutocomplete(selectedCategoryId);

  const transformChildren = (children) =>
    children.map((child) => ({
      id: child.id,
      nameRU: child.nameRU,
      children: transformChildren(child.children),
    }));

  const transformedTree = categoryAutocompleteProps.options.map((category) => ({
    id: category.id,
    nameRU: category.nameRU,
    children: transformChildren(category.children),
  }));

  const getAllCategoryIds = (categories) => {
    let ids = [];
    categories.forEach((category) => {
      ids.push(category.id.toString());
      if (category.children.length > 0) {
        ids = ids.concat(getAllCategoryIds(category.children));
      }
    });
    return ids;
  };

  const renderTreeItems = (categories) =>
    categories.map((category) => (
      <TreeItem
        key={category.id}
        itemId={category.id.toString()}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{category.nameRU}</span>
            <IconButton
              onClick={() => {
                setSelectedCategoryId(category.id.toString());
              }}
              aria-label="Выбрать категорию">
              {selectedCategoryId === category.id.toString() ? (
                <RadioButtonCheckedIcon />
              ) : (
                <RadioButtonUncheckedIcon />
              )}
            </IconButton>
          </div>
        }>
        {category.children.length > 0 && renderTreeItems(category.children)}
      </TreeItem>
    ));

  useEffect(() => {
    if (queryResult?.data?.data && !initialDataLoaded) {
      const samplesData = queryResult.data.data;
      setValue('nameKZ', samplesData.nameKZ);
      setValue('nameRU', samplesData.nameRU);
      setValue('nameEN', samplesData.nameEN);
      setValue('description', samplesData.description);
      setValue('price', samplesData.price.toString());
      setPhotos(samplesData.photos);
      setSelectedCategoryId(samplesData.categoryId.toString());
      setAttributeValues(samplesData.attributeValues);
      setInitialDataLoaded(true);
    }
  }, [queryResult, initialDataLoaded]);

  console.log(photos);

  useEffect(() => {
    if (expandedItems.length === 0) {
      handleExpandClick();
    }
  }, [transformedTree]);

  const handleDeleteImage = async (id, imgURL) => {
    const urlParts = new URL(imgURL);
    const pathname = urlParts.pathname;
    const filename = pathname.split('/').pop();

    try {
      await axios.delete(`products/${id}/delete-photo/${filename}`);

      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.url !== imgURL));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('nameKZ', data.nameKZ);
    formData.append('nameRU', data.nameRU);
    formData.append('nameEN', data.nameEN);
    formData.append('description', data.description);
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }
    formData.append('price', parseFloat(data.price.replace(/\s+/g, '')));
    formData.append('categoryId', selectedCategoryId);
    const validAttributes = attributeValues.filter(
      (attr) => attr.nameKZ.trim() !== '' && attr.nameRU.trim() !== '' && attr.nameEN.trim() !== '',
    );
    if (validAttributes.length > 0) {
      formData.append('attributeValues', JSON.stringify(validAttributes));
    }
    onFinish(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setValue('image', [file]); // Установка значения формы для отправки
      setPhotos((prevPhotos) => [...prevPhotos, { url: imageURL }]); // Добавление новой фотографии в массив
    } else {
      console.log('Файл не выбран');
    }
  };

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit(onSubmit) }}>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }} autoComplete="off">
        {photos &&
          photos.map((photo) => (
            <Box
              key={photo.id}
              sx={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img
                src={photo.url}
                alt="Product Photo"
                style={{ width: '100px', marginRight: '10px' }}
              />
              <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteImage(id, photo.url)}>
                Удалить
              </Button>
            </Box>
          ))}
        <Button variant="contained" component="label" margin="normal" fullWidth>
          Загрузить изображение
          <input type="file" hidden {...register('image')} onChange={handleImageChange} />
        </Button>
        <TextField
          {...register('nameKZ', {
            required: 'Введите название товара',
          })}
          error={!!(errors as any)?.nameKZ}
          helperText={(errors as any)?.nameKZ?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={'Название товара на казахском'}
        />
        <TextField
          {...register('nameRU', {
            required: 'Введите название товара',
          })}
          error={!!(errors as any)?.nameRU}
          helperText={(errors as any)?.nameRU?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={'Название товара на русском'}
        />
        <TextField
          {...register('nameEN', {
            required: 'Введите название товара',
          })}
          error={!!(errors as any)?.nameEN}
          helperText={(errors as any)?.nameEN?.message}
          margin="normal"
          fullWidth
          InputLabelProps={{ shrink: true }}
          type="text"
          label={'Название товара на английском'}
        />
        <TextField
          {...register('description', {
            maxLength: {
              value: 500,
              message: 'Описание не должно превышать 500 символов',
            },
          })}
          error={!!(errors as any)?.description}
          helperText={(errors as any)?.description?.message}
          margin="normal"
          fullWidth
          multiline
          rows={4}
          InputLabelProps={{ shrink: true }}
          type="text"
          label={'Описание товара'}
        />
        <Controller
          name="price"
          control={control}
          rules={{ required: 'Введите цену' }}
          render={({ field }) => (
            <NumericFormat
              {...field}
              customInput={TextField}
              thousandSeparator=" "
              decimalSeparator="."
              fixedDecimalScale
              allowNegative={false}
              suffix=" ₸"
              error={!!errors.price}
              fullWidth
              margin="normal"
              variant="outlined"
              label={'Цена в тенге'}
              InputLabelProps={{ shrink: true }}
            />
          )}
        />
        {/* <Button onClick={handleExpandClick}>
          {expandedItems.length === 0 ? 'Expand all' : 'Collapse all'}
        </Button> */}
        <SimpleTreeView
          expandedItems={expandedItems}
          onExpandedItemsChange={handleExpandedItemsChange}>
          {renderTreeItems(transformedTree)}
        </SimpleTreeView>
        {categoryIdAutocompleteProps?.options?.map((category) =>
          category?.attributes?.map((attributes, index) => (
            <Box
              key={attributes.attribute.id}
              sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TextField
                value={attributeValues[index]?.nameKZ ?? ''}
                onChange={(e) =>
                  handleAttributeValueChange(
                    index,
                    'nameKZ',
                    e.target.value,
                    attributes.attribute.id,
                  )
                }
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label={`Название атрибута на казахском: ${attributes.attribute.nameKZ}`}
              />
              <TextField
                value={attributeValues[index]?.nameRU ?? ''}
                onChange={(e) =>
                  handleAttributeValueChange(
                    index,
                    'nameRU',
                    e.target.value,
                    attributes.attribute.id,
                  )
                }
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label={`Название атрибута на русском: ${attributes.attribute.nameRU}`}
              />
              <TextField
                value={attributeValues[index]?.nameEN ?? ''}
                onChange={(e) =>
                  handleAttributeValueChange(
                    index,
                    'nameEN',
                    e.target.value,
                    attributes.attribute.id,
                  )
                }
                margin="normal"
                fullWidth
                InputLabelProps={{ shrink: true }}
                type="text"
                label={`Название атрибута на английском: ${attributes.attribute.nameEN}`}
              />
            </Box>
          )),
        )}
      </Box>
    </Create>
  );
};
