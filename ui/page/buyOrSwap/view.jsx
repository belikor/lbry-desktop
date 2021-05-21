// @flow
import * as ICONS from 'constants/icons';
import * as PAGES from 'constants/pages';
import React from 'react';
import Page from 'component/page';
import Card from 'component/common/card';
import Button from 'component/button';
import I18nMessage from 'component/i18nMessage';
import LbcSymbol from 'component/common/lbc-symbol';

export default function BuyOrSwapPage(props: any) {
  return (
    <Page>
      <div className="main__buy-or-swap">
        <section className="section__header">
          <h1 className="section__title--large">
            {''}
            <I18nMessage
              tokens={{
                lbc: <LbcSymbol size={48} />,
              }}
            >
              Buy or Swap %lbc%
            </I18nMessage>
          </h1>
          <p>
            <I18nMessage
              tokens={{
                lbc: <LbcSymbol size={22} />,
              }}
            >
              %lbc% can be purchased directly from a credit card, or through a cryptocurrency swap.
            </I18nMessage>
          </p>
        </section>

        <div className="section">
          <Card
            icon={ICONS.BUY}
            title={<LbcSymbol prefix={__('Buy')} size={28} />}
            subtitle={
              <I18nMessage
                tokens={{
                  learn_more: <Button button="link" label={__('Learn more')} href="https://lbry.com/faq/buy-lbc" />,
                }}
              >
                LBRY, Inc. partners with Moonpay to provide the option to purchase LBRY Credits. %learn_more%.
              </I18nMessage>
            }
            actions={<Button button="primary" label={__('Buy')} navigate={`/$/${PAGES.BUY}`} />}
          />

          <div className="section__divider">
            <hr />
            <p>{__('OR')}</p>
          </div>

          <Card
            icon={ICONS.COIN_SWAP}
            title={<I18nMessage tokens={{ lbc: <LbcSymbol size={22} /> }}>Swap Crypto for %lbc%</I18nMessage>}
            subtitle={__(
              'Send us crypto and we will send you an equivalent amount of Credits. You can pay with BTC, BCH, LTC, ETH, USDC or DAI.'
            )}
            actions={<Button button="primary" label={__('Swap')} navigate={`/$/${PAGES.SWAP}`} />}
          />
        </div>
      </div>
    </Page>
  );
}
