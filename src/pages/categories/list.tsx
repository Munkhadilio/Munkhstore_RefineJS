import React from 'react';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';
import { List, useDataGrid, EditButton, ShowButton, DeleteButton } from '@refinedev/mui';
import { useDelete } from '@refinedev/core';

export const CategoryList = () => {
  const { dataGridProps } = useDataGrid({});
  const { mutate } = useDelete();

  const transformChildren = (children) =>
    children.map((child) => ({
      id: child.id,
      nameRU: child.nameRU,
      children: transformChildren(child.children),
    }));

  const transformedTree = dataGridProps.rows.map((category) => ({
    id: category.id,
    nameRU: category.nameRU,
    children: transformChildren(category.children),
  }));

  const renderTreeItems = (categories) =>
    categories.map((category) => (
      <TreeItem
        key={category.id}
        itemId={category.id.toString()}
        label={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span>{category.nameRU}</span>
            <EditButton hideText recordItemId={category.id} />
            <ShowButton hideText recordItemId={category.id} />
            <DeleteButton
              hideText
              recordItemId={category.id}
              onClick={() => mutate({ resource: 'categories', id: category.id })}
            />
          </div>
        }>
        {category.children.length > 0 && renderTreeItems(category.children)}
      </TreeItem>
    ));

  return (
    <List>
      <SimpleTreeView>{renderTreeItems(transformedTree)}</SimpleTreeView>
    </List>
  );
};
