import { attributeListUrl } from "@dashboard/attributes/urls";
import { ATTRIBUTE_TYPES_WITH_DEDICATED_VALUES } from "@dashboard/attributes/utils/data";
import { Content } from "@dashboard/components/AppLayout/Content";
import { DetailedContent } from "@dashboard/components/AppLayout/DetailedContent";
import { RightSidebar } from "@dashboard/components/AppLayout/RightSidebar";
import { TopNav } from "@dashboard/components/AppLayout/TopNav";
import CardSpacer from "@dashboard/components/CardSpacer";
import Form from "@dashboard/components/Form";
import Metadata from "@dashboard/components/Metadata/Metadata";
import { MetadataFormData } from "@dashboard/components/Metadata/types";
import Savebar from "@dashboard/components/Savebar";
import { ListSettingsUpdate } from "@dashboard/components/TablePagination";
import {
  AttributeDetailsFragment,
  AttributeDetailsQuery,
  AttributeEntityTypeEnum,
  AttributeErrorFragment,
  AttributeInputTypeEnum,
  AttributeTypeEnum,
  MeasurementUnitsEnum,
} from "@dashboard/graphql";
import { SubmitPromise } from "@dashboard/hooks/useForm";
import useNavigator from "@dashboard/hooks/useNavigator";
import { maybe } from "@dashboard/misc";
import { ListSettings, ReorderAction } from "@dashboard/types";
import { mapEdgesToItems, mapMetadataItemToInput } from "@dashboard/utils/maps";
import useMetadataChangeTrigger from "@dashboard/utils/metadata/useMetadataChangeTrigger";
import { ConfirmButtonTransitionState } from "@saleor/macaw-ui";
import React from "react";
import { useIntl } from "react-intl";
import slugify from "slugify";

import AttributeDetails from "../AttributeDetails";
import AttributeOrganization from "../AttributeOrganization";
import AttributeProperties from "../AttributeProperties";
import AttributeValues from "../AttributeValues";

export interface AttributePageProps {
  attribute?: AttributeDetailsFragment | null | undefined;
  disabled: boolean;
  errors: AttributeErrorFragment[];
  saveButtonBarState: ConfirmButtonTransitionState;
  values?:
    | NonNullable<AttributeDetailsQuery["attribute"]>["choices"]
    | undefined;
  onDelete: () => void;
  onSubmit: (data: AttributePageFormData) => SubmitPromise;
  onValueAdd: () => void;
  onValueDelete: (id: string) => void;
  onValueReorder: ReorderAction;
  onValueUpdate: (id: string) => void;
  settings?: ListSettings;
  onUpdateListSettings?: ListSettingsUpdate;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  onNextPage: () => void;
  onPreviousPage: () => void;
  children: (data: AttributePageFormData) => React.ReactNode;
}

export interface AttributePageFormData extends MetadataFormData {
  type: AttributeTypeEnum;
  availableInGrid: boolean;
  filterableInDashboard: boolean;
  inputType: AttributeInputTypeEnum;
  entityType: AttributeEntityTypeEnum | null;
  filterableInStorefront: boolean;
  name: string;
  slug: string;
  storefrontSearchPosition: string;
  valueRequired: boolean;
  unit: MeasurementUnitsEnum | null | undefined;
  visibleInStorefront: boolean;
}

const AttributePage: React.FC<AttributePageProps> = ({
  attribute,
  disabled,
  errors: apiErrors,
  saveButtonBarState,
  values,
  onDelete,
  onSubmit,
  onValueAdd,
  onValueDelete,
  onValueReorder,
  onValueUpdate,
  settings,
  onUpdateListSettings,
  pageInfo,
  onNextPage,
  onPreviousPage,
  children,
}) => {
  const intl = useIntl();
  const navigate = useNavigator();

  const {
    isMetadataModified,
    isPrivateMetadataModified,
    makeChangeHandler: makeMetadataChangeHandler,
  } = useMetadataChangeTrigger();

  const initialForm: AttributePageFormData = !attribute
    ? {
        availableInGrid: true,
        entityType: null,
        filterableInDashboard: true,
        filterableInStorefront: true,
        inputType: AttributeInputTypeEnum.DROPDOWN,
        metadata: [],
        name: "",
        privateMetadata: [],
        slug: "",
        storefrontSearchPosition: "",
        type: AttributeTypeEnum.PRODUCT_TYPE,
        valueRequired: true,
        visibleInStorefront: true,
        unit: undefined,
      }
    : {
        availableInGrid: attribute.availableInGrid,
        entityType: attribute.entityType,
        filterableInDashboard: attribute.filterableInDashboard,
        filterableInStorefront: attribute.filterableInStorefront,
        inputType: attribute?.inputType ?? AttributeInputTypeEnum.DROPDOWN,
        metadata: attribute.metadata.map(mapMetadataItemToInput),
        name: attribute?.name ?? "",
        privateMetadata: attribute.privateMetadata.map(mapMetadataItemToInput),
        slug: attribute?.slug ?? "",
        storefrontSearchPosition: attribute.storefrontSearchPosition.toString(),
        type: attribute?.type ?? AttributeTypeEnum.PRODUCT_TYPE,
        valueRequired: !!attribute.valueRequired,
        visibleInStorefront: attribute.visibleInStorefront,
        unit: attribute?.unit ?? null,
      };

  const handleSubmit = (data: AttributePageFormData) => {
    const metadata = !attribute || isMetadataModified ? data.metadata : [];
    const type = attribute === null ? data.type : undefined;
    const privateMetadata =
      !attribute || isPrivateMetadataModified ? data.privateMetadata : [];

    return onSubmit({
      ...data,
      metadata,
      privateMetadata,
      slug: data.slug || slugify(data.name).toLowerCase(),
      type,
    });
  };

  return (
    <Form
      confirmLeave
      initial={initialForm}
      onSubmit={handleSubmit}
      disabled={disabled}
    >
      {({
        change,
        set,
        data,
        isSaveDisabled,
        submit,
        errors,
        setError,
        clearErrors,
      }) => {
        const changeMetadata = makeMetadataChangeHandler(change);

        return (
          <>
            <DetailedContent>
              <TopNav
                href={attributeListUrl()}
                title={
                  attribute === null
                    ? intl.formatMessage({
                        id: "8cUEPV",
                        defaultMessage: "Create New Attribute",
                        description: "page title",
                      })
                    : maybe(() => attribute.name)
                }
              ></TopNav>
              <Content>
                <AttributeDetails
                  canChangeType={attribute === null}
                  data={data}
                  disabled={disabled}
                  apiErrors={apiErrors}
                  onChange={change}
                  set={set}
                  errors={errors}
                  setError={setError}
                  clearErrors={clearErrors}
                />
                {ATTRIBUTE_TYPES_WITH_DEDICATED_VALUES.includes(
                  data.inputType,
                ) && (
                  <>
                    <CardSpacer />
                    <AttributeValues
                      inputType={data.inputType}
                      disabled={disabled}
                      values={mapEdgesToItems(values)}
                      onValueAdd={onValueAdd}
                      onValueDelete={onValueDelete}
                      onValueReorder={onValueReorder}
                      onValueUpdate={onValueUpdate}
                      settings={settings}
                      onUpdateListSettings={onUpdateListSettings}
                      pageInfo={pageInfo}
                      onNextPage={onNextPage}
                      onPreviousPage={onPreviousPage}
                    />
                  </>
                )}
                <CardSpacer />
                <Metadata data={data} onChange={changeMetadata} />
              </Content>
              <RightSidebar>
                <AttributeOrganization
                  canChangeType={attribute === null}
                  data={data}
                  disabled={disabled}
                  onChange={change}
                />
                <CardSpacer />
                <AttributeProperties
                  data={data}
                  errors={apiErrors}
                  disabled={disabled}
                  onChange={change}
                />
              </RightSidebar>
              <Savebar
                disabled={!!isSaveDisabled}
                state={saveButtonBarState}
                onCancel={() => navigate(attributeListUrl())}
                onSubmit={submit}
                onDelete={attribute === null ? undefined : onDelete}
              />
            </DetailedContent>
            {children(data)}
          </>
        );
      }}
    </Form>
  );
};
AttributePage.displayName = "AttributePage";
export default AttributePage;
