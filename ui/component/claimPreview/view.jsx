// @flow
import type { Node } from 'react';
import React, { useEffect, forwardRef } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { parseURI, COLLECTIONS_CONSTS } from 'lbry-redux';
import { formatLbryUrlForWeb } from 'util/url';
import { isEmpty } from 'util/object';
import FileThumbnail from 'component/fileThumbnail';
import UriIndicator from 'component/uriIndicator';
import FileProperties from 'component/fileProperties';
import ClaimTags from 'component/claimTags';
import SubscribeButton from 'component/subscribeButton';
import ChannelThumbnail from 'component/channelThumbnail';
import ClaimSupportButton from 'component/claimSupportButton';
import useGetThumbnail from 'effects/use-get-thumbnail';
import ClaimPreviewTitle from 'component/claimPreviewTitle';
import ClaimPreviewSubtitle from 'component/claimPreviewSubtitle';
import ClaimRepostAuthor from 'component/claimRepostAuthor';
import FileDownloadLink from 'component/fileDownloadLink';
import AbandonedChannelPreview from 'component/abandonedChannelPreview';
import PublishPending from 'component/publishPending';
import ClaimMenuList from 'component/claimMenuList';
import ClaimPreviewLoading from './claim-preview-loading';
import ClaimPreviewHidden from './claim-preview-no-mature';
import ClaimPreviewNoContent from './claim-preview-no-content';
import { ENABLE_NO_SOURCE_CLAIMS } from 'config';
import Button from 'component/button';
import * as ICONS from 'constants/icons';

type Props = {
  uri: string,
  claim: Claim,
  obscureNsfw: boolean,
  showUserBlocked: boolean,
  claimIsMine: boolean,
  pending?: boolean,
  reflectingProgress?: any, // fxme
  resolveUri: (string) => void,
  isResolvingUri: boolean,
  history: { push: (string) => void },
  title: string,
  nsfw: boolean,
  placeholder: string,
  type: string,
  hasVisitedUri: boolean,
  blackListedOutpoints: Array<{
    txid: string,
    nout: number,
  }>,
  filteredOutpoints: Array<{
    txid: string,
    nout: number,
  }>,
  mutedUris: Array<string>,
  blockedUris: Array<string>,
  channelIsBlocked: boolean,
  actions: boolean | Node | string | number,
  properties: boolean | Node | string | number | ((Claim) => Node),
  empty?: Node,
  onClick?: (any) => any,
  streamingUrl: ?string,
  getFile: (string) => void,
  customShouldHide?: (Claim) => boolean,
  showUnresolvedClaim?: boolean,
  showNullPlaceholder?: boolean,
  includeSupportAction?: boolean,
  hideActions?: boolean,
  renderActions?: (Claim) => ?Node,
  wrapperElement?: string,
  hideRepostLabel?: boolean,
  repostUrl?: string,
  hideMenu?: boolean,
  isLivestream?: boolean,
  collectionId?: string,
  collectionIndex: number,
  editCollection: (string, CollectionUpdateParams) => void,
  isCollectionMine: boolean,
  collectionUris: Array<Collection>,
};

const ClaimPreview = forwardRef<any, {}>((props: Props, ref: any) => {
  const {
    // core
    uri,
    claim,
    isResolvingUri,
    // core actions
    getFile,
    resolveUri,
    // claim properties
    // is the claim consider nsfw?
    nsfw,
    claimIsMine,
    streamingUrl,
    // user properties
    channelIsBlocked,
    hasVisitedUri,
    // component
    history,
    wrapperElement,
    type,
    placeholder,
    // pending
    reflectingProgress,
    pending,
    empty,
    // modifiers
    customShouldHide,
    showNullPlaceholder,
    // value from show mature content user setting
    // true if the user doesn't wanna see nsfw content
    obscureNsfw,
    showUserBlocked,
    showUnresolvedClaim,
    hideRepostLabel = false,
    hideActions = false,
    properties,
    onClick,
    actions,
    mutedUris,
    blockedUris,
    blackListedOutpoints,
    filteredOutpoints,
    includeSupportAction,
    renderActions,
    hideMenu = false,
    // repostUrl,
    isLivestream,
    collectionId,
    collectionIndex,
    editCollection,
    isCollectionMine,
    collectionUris,
  } = props;
  const WrapperElement = wrapperElement || 'li';
  const shouldFetch =
    claim === undefined || (claim !== null && claim.value_type === 'channel' && isEmpty(claim.meta) && !pending);
  const abandoned = !isResolvingUri && !claim;
  const isMyCollection = collectionId && (isCollectionMine || collectionId.includes('-'));
  const shouldHideActions = hideActions || isMyCollection || type === 'small' || type === 'tooltip';
  const canonicalUrl = claim && claim.canonical_url;
  const lastCollectionIndex = collectionUris ? collectionUris.length - 1 : 0;
  let isValid = false;
  if (uri) {
    try {
      parseURI(uri);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  }
  const isRepost = claim && claim.repost_url;

  const contentUri = claim && isRepost ? claim.canonical_url || claim.permanent_url : uri;
  const isChannelUri = isValid ? parseURI(contentUri).isChannel : false;
  const signingChannel = claim && claim.signing_channel;
  let navigateUrl = formatLbryUrlForWeb((claim && claim.canonical_url) || uri || '/');
  if (collectionId) {
    const collectionParams = new URLSearchParams();
    collectionParams.set(COLLECTIONS_CONSTS.COLLECTION_ID, collectionId);
    if (collectionIndex) collectionParams.set(COLLECTIONS_CONSTS.COLLECTION_INDEX, String(collectionIndex));
    navigateUrl = navigateUrl + `?` + collectionParams.toString();
  }
  const navLinkProps = {
    to: navigateUrl,
    onClick: (e) => e.stopPropagation(),
  };

  // do not block abandoned and nsfw claims if showUserBlocked is passed
  let shouldHide =
    placeholder !== 'loading' &&
    !showUserBlocked &&
    ((abandoned && !showUnresolvedClaim) || (!claimIsMine && obscureNsfw && nsfw));

  // This will be replaced once blocking is done at the wallet server level
  if (claim && !claimIsMine && !shouldHide && blackListedOutpoints) {
    shouldHide = blackListedOutpoints.some(
      (outpoint) =>
        (signingChannel && outpoint.txid === signingChannel.txid && outpoint.nout === signingChannel.nout) ||
        (outpoint.txid === claim.txid && outpoint.nout === claim.nout)
    );
  }
  // We're checking to see if the stream outpoint
  // or signing channel outpoint is in the filter list
  if (claim && !claimIsMine && !shouldHide && filteredOutpoints) {
    shouldHide = filteredOutpoints.some(
      (outpoint) =>
        (signingChannel && outpoint.txid === signingChannel.txid && outpoint.nout === signingChannel.nout) ||
        (outpoint.txid === claim.txid && outpoint.nout === claim.nout)
    );
  }
  // block stream claims
  if (claim && !shouldHide && !showUserBlocked && mutedUris.length && signingChannel) {
    shouldHide = mutedUris.some((blockedUri) => blockedUri === signingChannel.permanent_url);
  }
  if (claim && !shouldHide && !showUserBlocked && blockedUris.length && signingChannel) {
    shouldHide = blockedUris.some((blockedUri) => blockedUri === signingChannel.permanent_url);
  }

  if (!shouldHide && customShouldHide && claim) {
    if (customShouldHide(claim)) {
      shouldHide = true;
    }
  }

  // Weird placement warning
  // Make sure this happens after we figure out if this claim needs to be hidden
  const thumbnailUrl = useGetThumbnail(contentUri, claim, streamingUrl, getFile, shouldHide);

  function handleOnClick(e) {
    if (onClick) {
      onClick(e);
    }

    if (claim && !pending) {
      history.push(navigateUrl);
    }
  }

  useEffect(() => {
    if (isValid && !isResolvingUri && shouldFetch && uri) {
      resolveUri(uri);
    }
  }, [isValid, uri, isResolvingUri, shouldFetch, resolveUri]);

  if ((shouldHide && !showNullPlaceholder) || (isLivestream && !ENABLE_NO_SOURCE_CLAIMS)) {
    return null;
  }

  if (placeholder === 'loading' || (uri && !claim && isResolvingUri)) {
    return <ClaimPreviewLoading isChannel={isChannelUri} type={type} />;
  }

  if (claim && showNullPlaceholder && shouldHide && nsfw && obscureNsfw) {
    return (
      <ClaimPreviewHidden
        message={__('Mature content hidden by your preferences')}
        isChannel={isChannelUri}
        type={type}
      />
    );
  }

  if (claim && showNullPlaceholder && shouldHide) {
    return <ClaimPreviewHidden message={__('This content is hidden')} isChannel={isChannelUri} type={type} />;
  }

  if (!claim && (showNullPlaceholder || empty)) {
    return empty || <ClaimPreviewNoContent isChannel={isChannelUri} type={type} />;
  }

  if (!shouldFetch && showUnresolvedClaim && !isResolvingUri && claim === null) {
    return <AbandonedChannelPreview uri={contentUri} type />;
  }
  if (placeholder === 'publish' && !claim && contentUri.startsWith('lbry://@')) {
    return null;
  }

  return (
    <WrapperElement
      ref={ref}
      role="link"
      onClick={pending || type === 'inline' ? undefined : handleOnClick}
      className={classnames('claim-preview__wrapper', {
        'claim-preview__wrapper--channel': isChannelUri && type !== 'inline',
        'claim-preview__wrapper--inline': type === 'inline',
        'claim-preview__wrapper--small': type === 'small',
      })}
    >
      <>
        {!hideRepostLabel && <ClaimRepostAuthor uri={uri} />}

        <div
          className={classnames('claim-preview', {
            'claim-preview--small': type === 'small' || type === 'tooltip',
            'claim-preview--large': type === 'large',
            'claim-preview--inline': type === 'inline',
            'claim-preview--tooltip': type === 'tooltip',
            'claim-preview--channel': isChannelUri,
            'claim-preview--visited': !isChannelUri && !claimIsMine && hasVisitedUri,
            'claim-preview--pending': pending,
          })}
        >
          {isChannelUri && claim ? (
            <UriIndicator uri={contentUri} link>
              <ChannelThumbnail uri={contentUri} />
            </UriIndicator>
          ) : (
            <>
              {!pending ? (
                <NavLink {...navLinkProps}>
                  <FileThumbnail thumbnail={thumbnailUrl}>
                    {/* @if TARGET='app' */}
                    {claim && (
                      <div className="claim-preview__hover-actions">
                        <FileDownloadLink uri={canonicalUrl} hideOpenButton hideDownloadStatus />
                      </div>
                    )}
                    {/* @endif */}
                    {!isRepost && !isChannelUri && !isLivestream && (
                      <div className="claim-preview__file-property-overlay">
                        <FileProperties uri={contentUri} small />
                      </div>
                    )}
                  </FileThumbnail>
                </NavLink>
              ) : (
                <FileThumbnail thumbnail={thumbnailUrl} />
              )}
            </>
          )}

          <div className="claim-preview__text">
            <div className="claim-preview-metadata">
              <div className="claim-preview-info">
                {pending ? (
                  <ClaimPreviewTitle uri={contentUri} />
                ) : (
                  <NavLink {...navLinkProps}>
                    <ClaimPreviewTitle uri={uri} />
                  </NavLink>
                )}
              </div>
              <ClaimPreviewSubtitle uri={uri} type={type} />
              {(pending || !!reflectingProgress) && <PublishPending uri={uri} />}
            </div>
            {type !== 'small' && (
              <div className="claim-preview__actions">
                {!pending && (
                  <>
                    {renderActions && claim && renderActions(claim)}
                    {Boolean(isMyCollection && collectionId) && (
                      <>
                        <div className="collection-edit-buttons">
                          <div className="collection-edit-group">
                            <Button
                              button="alt"
                              className={'button-collection-order'}
                              disabled={collectionIndex === 0}
                              icon={ICONS.UP}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (editCollection) {
                                  // $FlowFixMe
                                  editCollection(collectionId, {
                                    order: { from: collectionIndex, to: collectionIndex - 1 },
                                  });
                                }
                              }}
                            />
                            <Button
                              button="alt"
                              className={'button-collection-order'}
                              icon={ICONS.DOWN}
                              disabled={collectionIndex === lastCollectionIndex}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (editCollection) {
                                  // $FlowFixMe
                                  editCollection(collectionId, {
                                    order: { from: collectionIndex, to: collectionIndex + 1 },
                                  });
                                }
                              }}
                            />
                          </div>
                          <div className="collection-edit-group">
                            <Button
                              button="alt"
                              icon={ICONS.DELETE}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // $FlowFixMe
                                if (editCollection) editCollection(collectionId, { claims: [claim], remove: true });
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {shouldHideActions || renderActions ? null : actions !== undefined ? (
                      actions
                    ) : (
                      <div className="claim-preview__primary-actions">
                        {!isChannelUri && signingChannel && (
                          <div className="claim-preview__channel-staked">
                            <ChannelThumbnail uri={signingChannel.permanent_url} />
                          </div>
                        )}

                        {isChannelUri && !channelIsBlocked && !claimIsMine && (
                          <SubscribeButton
                            uri={contentUri.startsWith('lbry://') ? contentUri : `lbry://${contentUri}`}
                          />
                        )}

                        {includeSupportAction && <ClaimSupportButton uri={uri} />}
                      </div>
                    )}
                  </>
                )}
                {claim && (
                  <React.Fragment>
                    {typeof properties === 'function' ? (
                      properties(claim)
                    ) : properties !== undefined ? (
                      properties
                    ) : (
                      <ClaimTags uri={uri} type={type} />
                    )}
                  </React.Fragment>
                )}
              </div>
            )}
          </div>
        </div>
        {!hideMenu && <ClaimMenuList uri={uri} collectionId={collectionId} />}
      </>
    </WrapperElement>
  );
});

export default withRouter(ClaimPreview);
