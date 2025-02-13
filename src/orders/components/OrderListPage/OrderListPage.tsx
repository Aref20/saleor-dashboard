import {
  extensionMountPoints,
  mapToMenuItems,
  useExtensions,
} from "@dashboard/apps/useExtensions";
import { LimitsInfo } from "@dashboard/components/AppLayout/LimitsInfo";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import { ButtonWithSelect } from "@dashboard/components/ButtonWithSelect";
import CardMenu from "@dashboard/components/CardMenu";
import FilterBar from "@dashboard/components/FilterBar";
import { OrderListQuery, RefreshLimitsQuery } from "@dashboard/graphql";
import { sectionNames } from "@dashboard/intl";
import { OrderListUrlSortField } from "@dashboard/orders/urls";
import {
  FilterPageProps,
  PageListProps,
  RelayToFlat,
  SortPage,
} from "@dashboard/types";
import { hasLimits, isLimitReached } from "@dashboard/utils/limits";
import { Card } from "@material-ui/core";
import { makeStyles } from "@saleor/macaw-ui";
import React from "react";
import { FormattedMessage, useIntl } from "react-intl";

import OrderLimitReached from "../OrderLimitReached";
import OrderList from "../OrderList";
import {
  createFilterStructure,
  OrderFilterKeys,
  OrderListFilterOpts,
} from "./filters";

export interface OrderListPageProps
  extends PageListProps,
    FilterPageProps<OrderFilterKeys, OrderListFilterOpts>,
    SortPage<OrderListUrlSortField> {
  limits: RefreshLimitsQuery["shop"]["limits"];
  orders: RelayToFlat<OrderListQuery["orders"]>;
  onSettingsOpen: () => void;
  onAdd: () => void;
}

const useStyles = makeStyles(
  theme => ({
    settings: {
      marginRight: theme.spacing(2),
    },
  }),
  { name: "OrderListPage" },
);

const OrderListPage: React.FC<OrderListPageProps> = ({
  currentTab,
  initialSearch,
  filterOpts,
  limits,
  tabs,
  onAdd,
  onAll,
  onSearchChange,
  onSettingsOpen,
  onFilterChange,
  onTabChange,
  onTabDelete,
  onTabSave,
  ...listProps
}) => {
  const intl = useIntl();
  const classes = useStyles({});
  const filterStructure = createFilterStructure(intl, filterOpts);
  const limitsReached = isLimitReached(limits, "orders");

  const { ORDER_OVERVIEW_CREATE, ORDER_OVERVIEW_MORE_ACTIONS } = useExtensions(
    extensionMountPoints.ORDER_LIST,
  );
  const extensionMenuItems = mapToMenuItems(ORDER_OVERVIEW_MORE_ACTIONS);
  const extensionCreateButtonItems = mapToMenuItems(ORDER_OVERVIEW_CREATE);

  return (
    <>
      <TopNav title={intl.formatMessage(sectionNames.orders)}>
        {!!onSettingsOpen && (
          <CardMenu
            className={classes.settings}
            menuItems={[
              {
                label: intl.formatMessage({
                  id: "WbV1Xm",
                  defaultMessage: "Order Settings",
                  description: "button",
                }),
                onSelect: onSettingsOpen,
              },
              ...extensionMenuItems,
            ]}
          />
        )}
        <ButtonWithSelect
          disabled={limitsReached}
          options={extensionCreateButtonItems}
          data-test-id="create-order-button"
          onClick={onAdd}
        >
          <FormattedMessage
            id="LshEVn"
            defaultMessage="Create order"
            description="button"
          />
        </ButtonWithSelect>
        {hasLimits(limits, "orders") && (
          <LimitsInfo
            text={intl.formatMessage(
              {
                id: "zyceue",
                defaultMessage: "{count}/{max} orders",
                description: "placed order counter",
              },
              {
                count: limits.currentUsage.orders,
                max: limits.allowedUsage.orders,
              },
            )}
          />
        )}
      </TopNav>
      {limitsReached && <OrderLimitReached />}
      <Card>
        <FilterBar
          currentTab={currentTab}
          initialSearch={initialSearch}
          onAll={onAll}
          onFilterChange={onFilterChange}
          onSearchChange={onSearchChange}
          onTabChange={onTabChange}
          onTabDelete={onTabDelete}
          onTabSave={onTabSave}
          tabs={tabs}
          allTabLabel={intl.formatMessage({
            id: "WRkCFt",
            defaultMessage: "All Orders",
            description: "tab name",
          })}
          filterStructure={filterStructure}
          searchPlaceholder={intl.formatMessage({
            id: "wTHjt3",
            defaultMessage: "Search Orders...",
          })}
        />
        <OrderList {...listProps} />
      </Card>
    </>
  );
};
OrderListPage.displayName = "OrderListPage";
export default OrderListPage;
