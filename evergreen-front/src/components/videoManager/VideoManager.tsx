import { useCallback, useEffect, useState } from 'react';
import { Provider, useStore } from 'react-redux';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatEther } from 'ethers';

import OfferSelector from './OfferSelector';

import { useAppSelector } from '../../hooks/useReduxHooks';
import useServerSettings from '../../hooks/useServerSettings';
import useSwal from '../../hooks/useSwal';
import { rFetch } from '../../utils/rFetch';
import { OptionsType } from '../common/commonTypes/InputSelectTypes.types';
import InputField from '../common/InputField';
import InputSelect from '../common/InputSelect';
import AnalyticsPopUp from '../DemoMediaUpload/UploadedListBox/AnalyticsPopUp/AnalyticsPopUp';

const VideoManager = () => {
  const [uploads, setUploads] = useState<any[]>([]);
  const [unlockData, setUnlockData] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [hiddenFlag, setHiddenFlag] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Array<OptionsType>>(
    []
  );

  const [filter, setFilter] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>({});
  const { currentUserAddress } = useAppSelector((store) => store.web3);
  const { primaryColor, textColor, primaryButtonColor, secondaryButtonColor } =
    useAppSelector((store) => store.colors);

  const { getBlockchainData } = useServerSettings();

  const reactSwal = useSwal();

  const loadCategories = useCallback(async () => {
    const { success, result } = await rFetch('/api/categories');
    if (success) {
      setCategoryOptions(
        result.map((item) => {
          return {
            label: item.name,
            value: item._id
          };
        })
      );
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setUnlockData([]);
    if (!selectedFile._id) {
      return;
    }
    (async () => {
      const { data, success } = await rFetch(
        `/api/files/${selectedFile._id}/unlocks`
      );
      if (success && data?.offers?.length) {
        setUnlockData(data.offers);
      }
    })();
  }, [selectedFile, refresh]);

  const refreshFileList = useCallback(async () => {
    if(!currentUserAddress) {
      return;
    }
    const { success, list } = await rFetch(
      `/api/files/list?hidden=${hiddenFlag}&userAddress=${currentUserAddress ?? ''}`
    );
    if (success) {
      setUploads(Object.keys(list).map((key) => list[key]));
    }
  }, [hiddenFlag]);

  useEffect(() => {
    if (!currentUserAddress) {
      return;
    }
    refreshFileList();
  }, [currentUserAddress, refreshFileList]);

  const store = useStore();

  const addRange = async () => {
    await reactSwal.fire({
      showConfirmButton: false,
      title: 'Adding range',
      html: (
        <Provider store={store}>
          <OfferSelector fileId={selectedFile._id} />
        </Provider>
      )
    });
    setRefresh(!refresh);
  };

  const refreshFileData = useCallback(async () => {
    const { success, file } = await rFetch(
      `/api/files/byId/${selectedFile._id}`
    );
    if (success) {
      setSelectedFile(file);
    }
  }, [selectedFile]);

  const updateFile = useCallback(
    async (body) => {
      await rFetch(`/api/files/byId/${selectedFile._id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      refreshFileData();
    },
    [selectedFile, refreshFileData]
  );

  const deleteFile = useCallback(async () => {
    reactSwal
      .fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          await rFetch(`/api/files/remove/${selectedFile._id}`, {
            method: 'DELETE'
          });
          setSelectedFile({});
          refreshFileList();
        }
      });
  }, [selectedFile, refreshFileList, reactSwal]);

  const updateCategory = useCallback(
    async (categoryId) => {
      await updateFile({
        category: categoryId
      });
    },
    [updateFile]
  );

  const updateDemoStatus = useCallback(async () => {
    await updateFile({
      demo: !selectedFile.demo
    });
  }, [updateFile, selectedFile]);

  const updateAgeRestriction = useCallback(async () => {
    await updateFile({
      ageRestricted: !selectedFile.ageRestricted
    });
  }, [updateFile, selectedFile]);

  const updateHiddenStatus = useCallback(async () => {
    await updateFile({
      hidden: !selectedFile.hidden
    });
  }, [updateFile, selectedFile]);

  const deleteUnlock = useCallback(
    async (offerId) => {
      await rFetch(`/api/files/${selectedFile._id}/unlocks`, {
        method: 'DELETE',
        body: JSON.stringify({
          offer: offerId
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setRefresh(!refresh);
    },
    [selectedFile, refresh]
  );

  return (
    <div className="row py-5 ps-5">
      <h4> My Uploads </h4>
      <div className="col-4">
        <button
          className="btn rair-button"
          disabled={!hiddenFlag}
          onClick={() => setHiddenFlag(false)}
          style={{
            background: secondaryButtonColor,
            color: textColor
          }}>
          Visible
        </button>
        <button
          className="btn rair-button"
          disabled={hiddenFlag}
          onClick={() => setHiddenFlag(true)}
          style={{
            background: primaryButtonColor,
            color: textColor
          }}>
          Hidden
        </button>
        <InputField
          customClass="form-control"
          placeholder="Title filter"
          getter={filter}
          setter={setFilter}
        />
        <div>
          {uploads &&
            uploads
              .filter((item: any) => {
                return item?.title
                  ?.toLowerCase()
                  ?.includes(filter.toLowerCase());
              })
              .map((item: any, index) => {
                return (
                  <button
                    onClick={() => setSelectedFile(item)}
                    className="btn btn-outline-primary col-12 my-1 border-rair"
                    key={index}>
                    {item.title}
                  </button>
                );
              })}
        </div>
      </div>
      <div className="col-8 p-5">
        {selectedFile.title && (
          <>
            <div className="w-100">
              <div className="row">
                <div className="col-4">
                  <img
                    className="w-100"
                    src={
                      selectedFile.type === 'video'
                        ? selectedFile.animatedThumbnail
                        : selectedFile.staticThumbnail
                    }
                  />
                </div>
                <div className="col-8 pb-5">
                  <table
                    style={{ backgroundColor: primaryColor }}
                    className="table-responsive">
                    <tbody>
                      {[
                        {
                          label: 'Type',
                          value: selectedFile.type
                        },
                        {
                          label: 'Title',
                          value: selectedFile.title
                        },
                        {
                          label: 'Category',
                          value: (
                            <InputSelect
                              options={categoryOptions}
                              placeholder="Please select"
                              getter={selectedFile.category?._id || 'null'}
                              setter={updateCategory}
                              customClass="form-control rounded-rair"
                              customCSS={{
                                backgroundColor: primaryColor,
                                color: textColor
                              }}
                            />
                          )
                        },
                        {
                          label: 'Views',
                          value: <AnalyticsPopUp videoId={selectedFile._id} />
                        },
                        {
                          label: 'Unlockable',
                          value: (
                            <button
                              onClick={updateDemoStatus}
                              style={{
                                background: secondaryButtonColor,
                                color: textColor
                              }}
                              className="btn rair-button">
                              {selectedFile.demo ? 'Demo' : 'Unlockable'}
                            </button>
                          )
                        },
                        {
                          label: 'Age Restriction',
                          value: (
                            <button
                              onClick={updateAgeRestriction}
                              style={{
                                background: primaryButtonColor,
                                color: textColor
                              }}
                              className="btn rair-button">
                              {selectedFile.ageRestricted
                                ? 'Age Restricted'
                                : 'NOT Age Restricted'}
                            </button>
                          )
                        },
                        {
                          label: 'Visibility',
                          value: (
                            <button
                              onClick={updateHiddenStatus}
                              style={{
                                background: secondaryButtonColor,
                                color: textColor
                              }}
                              className="btn rair-button">
                              {selectedFile.hidden ? 'Hidden' : 'Visible'}
                            </button>
                          )
                        },
                        {
                          label: 'Duration',
                          value: selectedFile.duration
                        },
                        {
                          label: 'Description',
                          value: selectedFile.description
                        }
                      ].map((item, index) => {
                        return (
                          <tr key={index}>
                            <th>{item.label}</th>
                            <th>{item.value}</th>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    onClick={deleteFile}
                    className="btn float-end btn-outline-danger">
                    <FontAwesomeIcon icon={faTrash} /> Delete Media File
                  </button>
                </div>
              </div>
            </div>
            Unlocks with the following ranges:
            {unlockData &&
              unlockData.map((unlock: any, index) => {
                return (
                  <div
                    className="text-start border-secondary col-12 rounded-rair mt-2 py-2 px-5 "
                    key={index}>
                    {getBlockchainData(unlock.contract.blockchain)?.image && (
                      <img
                        className="me-5"
                        style={{ width: '2rem' }}
                        src={
                          getBlockchainData(unlock.contract.blockchain)?.image
                        }
                      />
                    )}
                    <small className="me-3">
                      ({unlock.soldCopies} / {unlock.copies})
                    </small>
                    <span className="me-3">
                      {unlock.contract.title} - {unlock.offerName}
                    </span>
                    <b>
                      {formatEther(unlock.price)}{' '}
                      {getBlockchainData(unlock.contract.blockchain)?.symbol}
                    </b>
                    <button
                      className="btn float-end btn-danger"
                      onClick={() => deleteUnlock(unlock._id)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                );
              })}
            <br />
            <button
              onClick={addRange}
              style={{
                background: primaryButtonColor,
                color: textColor
              }}
              className="btn float-end rair-button">
              Add range{' '}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoManager;
