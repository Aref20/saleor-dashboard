import { ChannelsAvailabilityDropdown } from "@dashboard/components/ChannelsAvailabilityDropdown";
import {
  getChannelAvailabilityColor,
  getChannelAvailabilityLabel,
} from "@dashboard/components/ChannelsAvailabilityDropdown/utils";
import Checkbox from "@dashboard/components/Checkbox";
import Date from "@dashboard/components/Date";
import MoneyRange from "@dashboard/components/MoneyRange";
import ResponsiveTable from "@dashboard/components/ResponsiveTable";
import Skeleton from "@dashboard/components/Skeleton";
import TableCellAvatar from "@dashboard/components/TableCellAvatar";
import TableCellHeader from "@dashboard/components/TableCellHeader";
import TableHead from "@dashboard/components/TableHead";
import { TablePaginationWithContext } from "@dashboard/components/TablePagination";
import TableRowLink from "@dashboard/components/TableRowLink";
import TooltipTableCellHeader from "@dashboard/components/TooltipTableCellHeader";
import { commonTooltipMessages } from "@dashboard/components/TooltipTableCellHeader/messages";
import { ProductListColumns } from "@dashboard/config";
import { GridAttributesQuery, ProductListQuery } from "@dashboard/graphql";
import { maybe, renderCollection } from "@dashboard/misc";
import {
  getAttributeIdFromColumnValue,
  isAttributeColumnValue,
} from "@dashboard/products/components/ProductListPage/utils";
import { ProductListUrlSortField, productUrl } from "@dashboard/products/urls";
import { canBeSorted } from "@dashboard/products/views/ProductList/sort";
import {
  ChannelProps,
  ListActions,
  ListProps,
  RelayToFlat,
  SortPage,
} from "@dashboard/types";
import TDisplayColumn, {
  DisplayColumnProps,
} from "@dashboard/utils/columns/DisplayColumn";
import { getArrowDirection } from "@dashboard/utils/sort";
import { TableBody, TableCell, TableFooter } from "@material-ui/core";
import { makeStyles, Pill } from "@saleor/macaw-ui";
import clsx from "clsx";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { columnsMessages } from "./messages";
import ProductListAttribute from "./ProductListAttribute";

const useStyles = makeStyles(
  theme => ({
    [theme.breakpoints.up("md")]: {
      colName: {
        minWidth: 300,
      },
      colPrice: {
        width: 300,
      },
      colPublished: {
        width: 200,
      },
      colType: {
        width: 300,
      },
      colDate: {
        width: 200,
      },
    },
    colAttribute: {
      width: 200,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    colFill: {
      padding: 0,
      width: "100%",
    },
    colName: {
      wordBreak: "break-all",
      paddingLeft: 0,
      "&$colNameFixed": {
        width: 300,
      },
    },
    colAvatar: {
      wordBreak: "break-all",
    },
    colNameFixed: {},
    colNameWrapper: {
      display: "block",
    },
    colPrice: {
      textAlign: "right",
    },
    colPublished: {},
    colType: {
      wordBreak: "break-all",
    },
    link: {
      cursor: "pointer",
    },
    table: {
      tableLayout: "fixed",
    },
    tableContainer: {
      overflowX: "scroll",
    },
    textLeft: {
      textAlign: "left",
    },
    textRight: {
      textAlign: "right",
    },
  }),
  { name: "ProductList" },
);

const DisplayColumn = TDisplayColumn as React.FunctionComponent<
  DisplayColumnProps<ProductListColumns>
>;

interface ProductListProps
  extends ListProps<ProductListColumns>,
    ListActions,
    SortPage<ProductListUrlSortField>,
    ChannelProps {
  activeAttributeSortId: string;
  gridAttributes: RelayToFlat<GridAttributesQuery["grid"]>;
  products: RelayToFlat<ProductListQuery["products"]>;
}

export const ProductList: React.FC<ProductListProps> = props => {
  const {
    activeAttributeSortId,
    settings,
    disabled,
    isChecked,
    gridAttributes,
    products,
    selected,
    sort,
    toggle,
    toggleAll,
    toolbar,
    onUpdateListSettings,
    onSort,
    selectedChannelId,
    filterDependency,
  } = props;

  const classes = useStyles(props);
  const intl = useIntl();
  const gridAttributesFromSettings = settings.columns.filter(
    isAttributeColumnValue,
  );
  const numberOfColumns =
    (products?.length === 0 ? 1 : 2) + settings.columns.length;

  return (
    <div className={classes.tableContainer}>
      <ResponsiveTable className={classes.table}>
        <colgroup>
          {products?.length !== 0 && <col />}
          <col className={classes.colName} />
          <DisplayColumn column="productType" displayColumns={settings.columns}>
            <col className={classes.colType} />
          </DisplayColumn>
          <DisplayColumn
            column="availability"
            displayColumns={settings.columns}
          >
            <col className={classes.colPublished} />
          </DisplayColumn>
          {gridAttributesFromSettings.map(gridAttribute => (
            <col className={classes.colAttribute} key={gridAttribute} />
          ))}
          <DisplayColumn column="date" displayColumns={settings.columns}>
            <col className={classes.colDate} />
          </DisplayColumn>
          <DisplayColumn column="price" displayColumns={settings.columns}>
            <col className={classes.colPrice} />
          </DisplayColumn>
        </colgroup>
        <TableHead
          colSpan={numberOfColumns}
          selected={selected}
          disabled={disabled}
          items={products}
          toggleAll={toggleAll}
          toolbar={toolbar}
        >
          <TableCellHeader
            data-test-id="col-name-header"
            arrowPosition="right"
            className={clsx(classes.colName, {
              [classes.colNameFixed]: settings.columns.length > 4,
            })}
            direction={
              sort.sort === ProductListUrlSortField.name
                ? getArrowDirection(sort.asc)
                : undefined
            }
            onClick={() => onSort(ProductListUrlSortField.name)}
          >
            <FormattedMessage
              id="VQLIXd"
              defaultMessage="Name"
              description="product"
            />
          </TableCellHeader>
          <DisplayColumn column="productType" displayColumns={settings.columns}>
            <TableCellHeader
              data-test-id="col-type-header"
              className={classes.colType}
              direction={
                sort.sort === ProductListUrlSortField.productType
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(ProductListUrlSortField.productType)}
            >
              <FormattedMessage {...columnsMessages.type} />
            </TableCellHeader>
          </DisplayColumn>
          <DisplayColumn
            column="availability"
            displayColumns={settings.columns}
          >
            <TooltipTableCellHeader
              data-test-id="col-availability-header"
              className={classes.colPublished}
              direction={
                sort.sort === ProductListUrlSortField.status
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(ProductListUrlSortField.status)}
              disabled={
                !canBeSorted(
                  ProductListUrlSortField.status,
                  !!selectedChannelId,
                )
              }
              tooltip={intl.formatMessage(
                commonTooltipMessages.noFilterSelected,
                { filterName: filterDependency.label },
              )}
            >
              <FormattedMessage {...columnsMessages.availability} />
            </TooltipTableCellHeader>
          </DisplayColumn>
          {gridAttributesFromSettings.map(gridAttributeFromSettings => {
            const attributeId = getAttributeIdFromColumnValue(
              gridAttributeFromSettings,
            );

            return (
              <TableCellHeader
                className={classes.colAttribute}
                direction={
                  sort.sort === ProductListUrlSortField.attribute &&
                  attributeId === activeAttributeSortId
                    ? getArrowDirection(sort.asc)
                    : undefined
                }
                onClick={() =>
                  onSort(ProductListUrlSortField.attribute, attributeId)
                }
                key={gridAttributeFromSettings}
              >
                {maybe<React.ReactNode>(
                  () =>
                    gridAttributes.find(
                      gridAttribute => attributeId === gridAttribute.id,
                    ).name,
                  <Skeleton />,
                )}
              </TableCellHeader>
            );
          })}
          <DisplayColumn column="date" displayColumns={settings.columns}>
            <TableCellHeader
              data-test-id="col-date-header"
              className={classes.colDate}
              direction={
                sort.sort === ProductListUrlSortField.date
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              onClick={() => onSort(ProductListUrlSortField.date)}
            >
              <FormattedMessage {...columnsMessages.updatedAt} />
            </TableCellHeader>
          </DisplayColumn>
          <DisplayColumn column="price" displayColumns={settings.columns}>
            <TooltipTableCellHeader
              data-test-id="col-price-header"
              className={classes.colPrice}
              direction={
                sort.sort === ProductListUrlSortField.price
                  ? getArrowDirection(sort.asc)
                  : undefined
              }
              textAlign="right"
              onClick={() => onSort(ProductListUrlSortField.price)}
              disabled={
                !canBeSorted(ProductListUrlSortField.price, !!selectedChannelId)
              }
              tooltip={intl.formatMessage(
                commonTooltipMessages.noFilterSelected,
                { filterName: filterDependency.label },
              )}
            >
              <FormattedMessage {...columnsMessages.price} />
            </TooltipTableCellHeader>
          </DisplayColumn>
        </TableHead>
        <TableFooter>
          <TableRowLink>
            <TablePaginationWithContext
              colSpan={numberOfColumns}
              settings={settings}
              onUpdateListSettings={onUpdateListSettings}
            />
          </TableRowLink>
        </TableFooter>
        <TableBody>
          {renderCollection(
            products,
            product => {
              const isSelected = product ? isChecked(product.id) : false;
              const channel = product?.channelListings.find(
                listing => listing.channel.id === selectedChannelId,
              );

              return (
                <TableRowLink
                  selected={isSelected}
                  hover={!!product}
                  key={product ? product.id : "skeleton"}
                  href={product && productUrl(product.id)}
                  className={classes.link}
                  data-test-id={"id-" + (product ? product?.id : "skeleton")}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={disabled}
                      disableClickPropagation
                      onChange={() => toggle(product.id)}
                    />
                  </TableCell>
                  <TableCellAvatar
                    className={classes.colAvatar}
                    thumbnail={maybe(() => product.thumbnail.url)}
                  >
                    {product?.name ? (
                      <span data-test-id="name">{product.name}</span>
                    ) : (
                      <Skeleton />
                    )}
                  </TableCellAvatar>
                  <DisplayColumn
                    column="productType"
                    displayColumns={settings.columns}
                  >
                    <TableCell
                      className={classes.colType}
                      data-test-id="product-type"
                    >
                      {product?.productType?.name || <Skeleton />}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="availability"
                    displayColumns={settings.columns}
                  >
                    <TableCell
                      className={classes.colPublished}
                      data-test-id="availability"
                      data-test-availability={
                        !!product?.channelListings?.length
                      }
                    >
                      {(product &&
                        (channel ? (
                          <Pill
                            label={intl.formatMessage(
                              getChannelAvailabilityLabel(channel),
                            )}
                            color={getChannelAvailabilityColor(channel)}
                          />
                        ) : (
                          <ChannelsAvailabilityDropdown
                            channels={product?.channelListings}
                          />
                        ))) ?? <Skeleton />}
                    </TableCell>
                  </DisplayColumn>
                  {gridAttributesFromSettings.map(gridAttribute => (
                    <TableCell
                      className={classes.colAttribute}
                      key={gridAttribute}
                      data-test-id="attribute"
                      data-test-attribute={getAttributeIdFromColumnValue(
                        gridAttribute,
                      )}
                    >
                      <ProductListAttribute
                        attribute={gridAttribute}
                        productAttributes={product?.attributes}
                      />
                    </TableCell>
                  ))}
                  <DisplayColumn
                    column="date"
                    displayColumns={settings.columns}
                  >
                    <TableCell className={classes.colDate} data-test-id="date">
                      {product?.updatedAt ? (
                        <Date date={product.updatedAt} />
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                  </DisplayColumn>
                  <DisplayColumn
                    column="price"
                    displayColumns={settings.columns}
                  >
                    <TableCell
                      className={classes.colPrice}
                      data-test-id="price"
                    >
                      {product?.channelListings ? (
                        <MoneyRange
                          from={channel?.pricing?.priceRange?.start?.net}
                          to={channel?.pricing?.priceRange?.stop?.net}
                        />
                      ) : (
                        <Skeleton />
                      )}
                    </TableCell>
                  </DisplayColumn>
                </TableRowLink>
              );
            },
            () => (
              <TableRowLink>
                <TableCell colSpan={numberOfColumns}>
                  <FormattedMessage
                    id="Q1Uzbb"
                    defaultMessage="No products found"
                  />
                </TableCell>
              </TableRowLink>
            ),
          )}
        </TableBody>
      </ResponsiveTable>
    </div>
  );
};
ProductList.displayName = "ProductList";
export default ProductList;
