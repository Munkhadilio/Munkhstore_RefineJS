import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useDelete } from '@refinedev/core';
import { DeleteButton, EditButton, List, ShowButton, useDataGrid } from '@refinedev/mui';
import React from 'react';

export const ProductList = () => {
  const { mutate } = useDelete();
  const { dataGridProps } = useDataGrid({});

  const columns = React.useMemo<GridColDef[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        type: 'number',
        minWidth: 40,
      },
      {
        field: 'nameKZ',
        headerName: 'Name KZ',
        type: 'text',
        minWidth: 150,
      },
      {
        field: 'nameRU',
        headerName: 'Name RU',
        type: 'text',
        minWidth: 150,
      },
      {
        field: 'nameEN',
        headerName: 'Name EN',
        type: 'text',
        minWidth: 150,
      },
      {
        field: 'category',
        headerName: 'Category',
        type: 'text',
        valueGetter: (params) => params.row.category.nameRU || '',
        minWidth: 250,
      },
      {
        field: 'actions',
        headerName: 'Actions',
        sortable: false,
        renderCell: function render({ row }) {
          return (
            <>
              <EditButton hideText recordItemId={row.slugEN} />
              <ShowButton hideText recordItemId={row.slugEN} />
              <DeleteButton
                hideText
                recordItemId={row.slugEN}
                onClick={() =>
                  mutate({
                    resource: 'products',
                    id: row.slugEN,
                  })
                }
              />
            </>
          );
        },
        align: 'center',
        headerAlign: 'center',
        minWidth: 80,
      },
    ],
    [],
  );

  return (
    <List>
      <DataGrid {...dataGridProps} columns={columns} autoHeight />
    </List>
  );
};
