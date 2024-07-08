import {
  Autocomplete,
  Box,
  FormControlLabel,
  MenuItem,
  Select,
  Button,
  Switch,
  TextField,
  IconButton,
} from '@mui/material';
import { Edit, useAutocomplete } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from './../../../axios';

export const CategoryEdit = () => {
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
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [attributeValues, setAttributeValues] = useState([
    { id: '', nameKZ: '', nameRU: '', nameEN: '' },
  ]);
  const [categoryData, setCategoryData] = useState(null);

  const handleAddAttributeValue = () => {
    setAttributeValues([...attributeValues, { id: '', nameKZ: '', nameRU: '', nameEN: '' }]);
  };

  const handleRemoveAttributeValue = (index) => {
    if (attributeValues.length === 1) {
      return;
    }
    setAttributeValues(attributeValues.filter((_, i) => i !== index));
  };

  const handleAttributeValueChange = (index, field, value) => {
    const newAttributeValues = attributeValues.map((attr, i) =>
      i === index ? { ...attr, [field]: value } : attr,
    );
    setAttributeValues(newAttributeValues);
  };

  const [lastInteraction, setLastInteraction] = useState('');

  const { autocompleteProps: categoryAutocompleteProps } = useAutocomplete({
    resource: 'categories',
  });

  const selectedCategoryId = useWatch({
    control,
    name: 'category',
  });

  const selectedSubcategory1Id = useWatch({
    control,
    name: 'subcategory1',
  });

  const filteredSubcategories = categoryAutocompleteProps.options
    .flatMap((cat) => cat?.children)
    .filter((subcat) => subcat?.parentId === selectedCategoryId && subcat?.id !== categoryData?.id);

  const filteredCategories = categoryAutocompleteProps.options.filter(
    (cat) => cat?.id !== categoryData?.id,
  );

  useEffect(() => {
    switch (true) {
      case lastInteraction === 'category':
        setValue('parentId', selectedCategoryId);
        break;
      case lastInteraction === 'subcategory1':
        setValue('parentId', selectedSubcategory1Id);
        break;
      default:
        break;
    }
  }, [selectedCategoryId, selectedSubcategory1Id, lastInteraction, setValue]);

  const samplesData = queryResult?.data?.data;
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (samplesData && samplesData.length > 0) {
          const data = samplesData[0];
          setCategoryData(data);
          setValue('nameKZ', data.nameKZ);
          setValue('nameRU', data.nameRU);
          setValue('nameEN', data.nameEN);
          setValue('status', data.status);
          setImageURL(data.imageURL);
          if (data.parent) {
            setIsSubcategory(true);
            setValue('category', data.parent.id);
            if (data.parent.parent) {
              setValue('subcategory1', data.parent.parent.id);
            }
          }

          if (data.attributes && data.attributes.length > 0) {
            const formattedAttributes = data.attributes.map((attr) => ({
              nameKZ: attr.attribute.nameKZ || '',
              nameRU: attr.attribute.nameRU || '',
              nameEN: attr.attribute.nameEN || '',
              id: attr.attribute.id,
            }));
            setAttributeValues(formattedAttributes);
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
      }
    };

    fetchData();
  }, [samplesData, setValue]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('nameKZ', data.nameKZ);
    formData.append('nameRU', data.nameRU);
    formData.append('nameEN', data.nameEN);

    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    if (isSubcategory) {
      formData.append('parentId', selectedCategoryId);

      const validAttributes = attributeValues.filter(
        (attr) =>
          attr.nameKZ.trim() !== '' && attr.nameRU.trim() !== '' && attr.nameEN.trim() !== '',
      );

      if (validAttributes.length > 0) {
        formData.append(
          'attributes',
          JSON.stringify(
            validAttributes.map((attr) => ({
              id: attr.id || undefined,
              nameKZ: attr.nameKZ,
              nameRU: attr.nameRU,
              nameEN: attr.nameEN,
            })),
          ),
        );
      }
    }
    formData.append('status', data.status);

    onFinish(formData);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageURL = URL.createObjectURL(file);
      setValue('image', [file]);
      setImageURL(imageURL);
    } else {
      console.log('файла нету');
    }
  };

  const handleDeleteImage = async (id, imgURL) => {
    const urlParts = new URL(imgURL);

    const pathname = urlParts.pathname;
    const filename = pathname.split('/').pop();

    try {
      axios.delete(`categories/${id}/delete-photo/${filename}`);
      setImageURL(null); // Reset the imageURL state after successful deletion
    } catch (error) {
      console.error('Error deleting image:', error);
      // Handle error if deletion fails
    }
  };

  return (
    <Edit
      isLoading={formLoading}
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit(onSubmit) }}>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }} autoComplete="off">
        <FormControlLabel
          control={
            <Switch
              checked={isSubcategory}
              onChange={(e) => setIsSubcategory(e.target.checked)}
              name="isSubcategory"
            />
          }
          label="Это подкатегория?"
        />
        {!isSubcategory && (
          <>
            <TextField
              {...register('nameKZ', { required: 'Введите название категории' })}
              error={!!errors.nameKZ}
              helperText={errors.nameKZ?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название категории на казахском'}
            />
            <TextField
              {...register('nameRU', { required: 'Введите название категории' })}
              error={!!errors.nameRU}
              helperText={errors.nameRU?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название категории на русском'}
            />
            <TextField
              {...register('nameEN', { required: 'Введите название категории' })}
              error={!!errors.nameEN}
              helperText={errors.nameEN?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название категории на английском'}
            />
          </>
        )}
        {!imageURL && (
          <Button variant="contained" component="label" margin="normal" fullWidth>
            Загрузить изображение
            <input type="file" hidden {...register('image')} onChange={handleImageChange} />
          </Button>
        )}
        {imageURL && (
          <>
            <img src={imageURL} alt="Uploaded" style={{ maxWidth: '100%', margin: '10px 0' }} />
            <Button
              variant="contained"
              component="label"
              margin="normal"
              fullWidth
              onClick={() => handleDeleteImage(id, imageURL)}>
              Удалить изображение
            </Button>
          </>
        )}
        {isSubcategory && (
          <>
            <TextField
              {...register('nameKZ', {
                required: 'Введите название подкатегории',
              })}
              error={!!(errors as any)?.nameKZ}
              helperText={(errors as any)?.nameKZ?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название подкатегории на казахском'}
            />
            <TextField
              {...register('nameRU', {
                required: 'Введите название подкатегории',
              })}
              error={!!(errors as any)?.nameRU}
              helperText={(errors as any)?.nameRU?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название подкатегории на русском'}
            />
            <TextField
              {...register('nameEN', {
                required: 'Введите название подкатегории',
              })}
              error={!!(errors as any)?.nameEN}
              helperText={(errors as any)?.nameEN?.message}
              margin="normal"
              fullWidth
              InputLabelProps={{ shrink: true }}
              type="text"
              label={'Название подкатегории на английском'}
            />
            <Controller
              control={control}
              name="category"
              rules={{ required: 'Это поле обязательно' }}
              defaultValue={null}
              render={({ field }) => (
                <Autocomplete
                  {...categoryAutocompleteProps}
                  options={filteredCategories}
                  {...field}
                  value={filteredCategories.find((option) => option?.id === field?.value) || null}
                  onChange={(_, value) => {
                    field.onChange(value ? value.id : null);
                    setLastInteraction('category');
                  }}
                  getOptionLabel={(item) => {
                    if (typeof item === 'string') {
                      return item;
                    }
                    return item?.nameRU ?? '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option.id === (value ? value.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={'Категория'}
                      margin="normal"
                      variant="outlined"
                      error={!!(errors as any)?.category}
                      helperText={(errors as any)?.category?.message}
                      required
                    />
                  )}
                />
              )}
            />
            <Controller
              control={control}
              name="subcategory1"
              defaultValue={null}
              render={({ field }) => (
                <Autocomplete
                  options={filteredSubcategories}
                  {...field}
                  value={
                    filteredSubcategories.find((option) => option?.id === field?.value) || null
                  }
                  onChange={(_, value) => {
                    field.onChange(value ? value.id : null);
                    setLastInteraction('subcategory1');
                  }}
                  getOptionLabel={(item) => {
                    if (typeof item === 'string') {
                      return item;
                    }
                    return item?.nameRU ?? '';
                  }}
                  isOptionEqualToValue={(option, value) => {
                    return option.id === (value ? value.id : null);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={'Подкатегория первого уровня'}
                      margin="normal"
                      variant="outlined"
                      error={!!(errors as any)?.subcategory}
                      helperText={(errors as any)?.subcategory?.message}
                    />
                  )}
                />
              )}
            />
            {attributeValues.map((attr, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {}
                <TextField
                  value={attr.nameKZ}
                  onChange={(e) => handleAttributeValueChange(index, 'nameKZ', e.target.value)}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  label="Название атрибута на казахском"
                />
                <TextField
                  value={attr.nameRU}
                  onChange={(e) => handleAttributeValueChange(index, 'nameRU', e.target.value)}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  label="Название атрибута на русском"
                />
                <TextField
                  value={attr.nameEN}
                  onChange={(e) => handleAttributeValueChange(index, 'nameEN', e.target.value)}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  label="Название атрибута на английском"
                />
                <IconButton onClick={() => handleRemoveAttributeValue(index)}>
                  <RemoveIcon />
                </IconButton>
                <IconButton onClick={handleAddAttributeValue}>
                  <AddIcon />
                </IconButton>
              </Box>
            ))}

            <input type="hidden" {...register('parentId')} />
          </>
        )}
        <Controller
          name="status"
          control={control}
          render={({ field }) => {
            return (
              <Select label={'Status'} {...field} value={field?.value || 'active'}>
                <MenuItem value="active">Активная</MenuItem>
                <MenuItem value="inactive">Неактивная</MenuItem>
              </Select>
            );
          }}
        />
        {errors.image && <span>{errors.image.message}</span>}
      </Box>
    </Edit>
  );
};
