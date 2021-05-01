// @flow
import React from 'react';
import Button from 'component/button';
import { Form } from 'component/common/form';
import { Modal } from 'modal/modal';
import Card from 'component/common/card';
import LbcSymbol from 'component/common/lbc-symbol';
import ChannelThumbnail from 'component/channelThumbnail';

type TipParams = { amount: number, claim_id: string, channel_id?: string };

type Props = {
  destination: string,
  amount: number,
  closeModal: () => void,
  sendToAddress: (string, number) => void,
  sendTip: (TipParams, boolean) => void,
  isClaim: boolean,
  claim: StreamClaim,
  claimTitle: string,
  thumbnailUrl: string
};

class ModalConfirmTransaction extends React.PureComponent<Props> {
  onConfirmed() {
    const { closeModal, sendToAddress, sendTip, amount, destination, isClaim, claim } = this.props;
    if (isClaim) {
      const claimId = claim && claim.claim_id;
      const tipParams: TipParams = { amount: amount, claim_id: claimId };
      sendTip(tipParams, false);
    } else {
      sendToAddress(destination, amount);
    }
    closeModal();
  }

  render() {
    const { amount, destination, closeModal, isClaim, claimTitle, thumbnailUrl } = this.props;
    const title = __('Confirm Transaction');
    return (
      <Modal isOpen contentLabel={title} type="card" onAborted={closeModal}>
        <Form onSubmit={() => this.onConfirmed()}>
          <Card
            title={title}
            body={
              <div className="section section--padded card--inline confirm__wrapper">
                <div className="section">
                  <div className="confirm__label">{__('Sending')}</div>
                  <div className="confirm__value">{<LbcSymbol postfix={amount} size={22} />}</div>
                  <div className="confirm__label">{__('To')}</div>
                  <div className="confirm__value">{destination}</div>
                  <div>
                    {isClaim && 
                      <ChannelThumbnail
                        className="channel__thumbnail"
                        uri={destination}
                        allowGifs
                        showDelayedMessage
                      />}
                    {isClaim && <h1 className="card__title">{claimTitle}</h1>}
                  </div>
                </div>
              </div>
            }
            actions={
              <>
                <div className="section__actions">
                  <Button autoFocus button="primary" label={__('Send')} onClick={() => this.onConfirmed()} />
                  <Button button="link" label={__('Cancel')} onClick={closeModal} />
                </div>
                <p className="help">{__('Once the transaction is sent, it cannot be reversed.')}</p>
              </>
            }
          />
        </Form>
      </Modal>
    );
  }
}

export default ModalConfirmTransaction;
