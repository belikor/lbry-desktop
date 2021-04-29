import { connect } from 'react-redux';
import {
  selectBuiltinCollections,
  selectMyPublishedMixedCollections,
  selectMyPublishedPlaylistCollections,
  selectMyUnpublishedCollections, // should probably distinguish types
  // selectSavedCollections,
} from 'lbry-redux';
import CollectionsListMine from './view';

const select = (state) => ({
  builtinCollections: selectBuiltinCollections(state), // select
  publishedCollections: selectMyPublishedMixedCollections(state),
  publishedPlaylists: selectMyPublishedPlaylistCollections(state),
  unpublishedCollections: selectMyUnpublishedCollections(state),
  // savedCollections: selectSavedCollections(state),
});

export default connect(select)(CollectionsListMine);
