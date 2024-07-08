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
import { Create, useAutocomplete } from '@refinedev/mui';
import { useForm } from '@refinedev/react-hook-form';
import { useEffect, useState } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export const CategoryCreate = () => {
  const {
    saveButtonProps,
    refineCore: { formLoading, onFinish },
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({});

  const [isSubcategory, setIsSubcategory] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  const [attributeValues, setAttributeValues] = useState([{ nameKZ: '', nameRU: '', nameEN: '' }]);

  const handleAddAttributeValue = () => {
    setAttributeValues([...attributeValues, { nameKZ: '', nameRU: '', nameEN: '' }]);
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
    .filter((subcat) => subcat?.parentId === selectedCategoryId);

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

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append('nameKZ', data.nameKZ);
    formData.append('nameRU', data.nameRU);
    formData.append('nameEN', data.nameEN);
    formData.append('status', data.status ? data.status : 'active');
    if (data.image && data.image[0]) {
      formData.append('image', data.image[0]);
    }

    if (isSubcategory) {
      formData.append('parentId', data.parentId);

      // Фильтруем атрибуты, оставляя только те, у которых заполнены все поля
      const validAttributes = attributeValues.filter(
        (attr) =>
          attr.nameKZ.trim() !== '' && attr.nameRU.trim() !== '' && attr.nameEN.trim() !== '',
      );

      if (validAttributes.length > 0) {
        formData.append('attributes', JSON.stringify(validAttributes));
      }
    }

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

  return (
    <Create
      isLoading={formLoading}
      saveButtonProps={{ ...saveButtonProps, onClick: handleSubmit(onSubmit) }}>
      <Box component="form" sx={{ display: 'flex', flexDirection: 'column' }} autoComplete="off">
        {imageURL && (
          <>
            <img src={imageURL} alt="Uploaded" style={{ maxWidth: '100%', margin: '10px 0' }} />
            <Button variant="contained" component="label" margin="normal" fullWidth>
              Удалить изображение
              <input type="file" hidden {...register('image')} onChange={handleImageChange} />
            </Button>
          </>
        )}
        <Button variant="contained" component="label" margin="normal" fullWidth>
          Загрузить изображение
          <input type="file" hidden {...register('image')} onChange={handleImageChange} />
        </Button>
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
                  {...field}
                  value={
                    categoryAutocompleteProps.options.find(
                      (option) => option?.id === field?.value,
                    ) || null
                  }
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
                  label="Название атрибута на казахском"
                />
                <TextField
                  value={attr.nameEN}
                  onChange={(e) => handleAttributeValueChange(index, 'nameEN', e.target.value)}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  type="text"
                  label="Название атрибута на казахском"
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
          {...register('status')}
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
    </Create>
  );
};
