import ExternalLink from "@dashboard/components/ExternalLink";
import { useTheme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import React from "react";
import GitHubButton from "react-github-btn";
import { FormattedMessage } from "react-intl";

import { SALEOR_GRAPHQL_URL, SALEOR_STOREFRONT_URL } from "./constants";
import styles from "./styles";

export const DemoBanner: React.FC = () => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const classes = styles();

  return (
    <div className={classes.wrapper}>
      <div className={classes.borderedWrapper}>
        <div />
        <div className={classes.linkList}>
          <ExternalLink className={classes.link} href={SALEOR_STOREFRONT_URL}>
            {isMdUp ? (
              <FormattedMessage
                id="4gZl/n"
                defaultMessage="See <emphasis>DEMO STOREFRONT</emphasis>"
                values={{
                  emphasis: (children: any) => (
                    <em className={classes.textEmphasis}>{children}</em>
                  ),
                }}
              />
            ) : (
              <div className={classes.textEmphasis}>
                <FormattedMessage id="LmKz3g" defaultMessage="Storefront" />
              </div>
            )}
          </ExternalLink>
          {isMdUp && <div className={classes.divider} />}
          <ExternalLink className={classes.link} href={SALEOR_GRAPHQL_URL}>
            {isMdUp ? (
              <FormattedMessage
                id="/X8Mjx"
                defaultMessage="Play with <emphasis>GraphQL API</emphasis>"
                values={{
                  emphasis: (children: any) => (
                    <em className={classes.textEmphasis}>{children}</em>
                  ),
                }}
              />
            ) : (
              <div className={classes.textEmphasis}>
                <FormattedMessage id="xwEc8K" defaultMessage="API" />
              </div>
            )}
          </ExternalLink>

          <div className={classes.githubStarButton}>
            <GitHubButton
              href="https://github.com/saleor/saleor"
              data-icon="octicon-star"
              data-show-count="true"
              data-size="large"
              aria-label="Star saleor/saleor on GitHub"
            >
              Star us on GitHub
            </GitHubButton>
          </div>
        </div>
      </div>
    </div>
  );
};

DemoBanner.displayName = "DemoBanner";
export default DemoBanner;
