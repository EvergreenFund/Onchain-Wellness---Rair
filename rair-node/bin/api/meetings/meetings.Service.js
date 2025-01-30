const axios = require('axios');
const qs = require('query-string');
const { ObjectId } = require('mongodb');
const { File, Offer, Unlock, Contract } = require('../../models');
const { checkBalanceProduct } = require('../../integrations/ethers/tokenValidation');

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2'

exports.getMeeting = async (req, res, next) => {
  const { headerConfig, params } = req;
  const { meetingId } = params;

  try {
    const request = await axios.get(`${ZOOM_API_BASE_URL}/meetings/${meetingId}`, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.createMeetingUnlock = async (req, res, next) => {
  const { headerConfig, params, user, body } = req;
    const offers = [body.offer]
    const tokenId = body.tokenId

  if (user === undefined) {
    return next(new Error('Not logged in'))
  }

  try {
    const foundOffers = await Offer.find({
      _id: { $in: offers.map((offer) => new ObjectId(offer)) },
    })
      .populate('contract');

    const contract = await Contract.findOne({
      _id: foundOffers[0].contract,
    })

    const ownsMediaNFT = await checkBalanceProduct(
      user.publicAddress,
      contract.blockchain,
      contract.contractAddress,
      foundOffers[0].product,
      foundOffers[0].range[0],
      foundOffers[0].range[1],
    )

    if(!ownsMediaNFT) {
      throw new Error("User does not own the media NFT")
    }


    const request = await axios.post(`${ZOOM_API_BASE_URL}/users/me/meetings`, body, headerConfig);

    const meta = {
      "mainManifest": "manifest",
      "uploader": user.publicAddress.toLowerCase(),
      "encryptionType": "AES256",
      "offers": offers,
      "category": "60d5ec49f1b2c72b8c9e4b8c",  // MongoDB ObjectId
      "type": "zoom",
      "extension": "zoom",
      "duration": "3600",
      "title": "Test Video",
      "staticThumbnail": "https://storage.googleapis.com/rair_images/1683038949498-1548817833.jpeg",
    }

    await File.create({
      _id: request.data.id,
      meetingId: request.data.id,
      ...meta
    })

    const offerIds = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const offerData of foundOffers) {
      offerIds.push(offerData._id);
    }

    await Unlock.create({
      file: request.data.id,
      offers: offerIds,
    });

    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.createMeeting = async (req, res, next) => {
  const { headerConfig, params, body } = req;
  const { userId } = params;

  try {
    const request = await axios.post(`${ZOOM_API_BASE_URL}/users/${userId}/meetings`, body, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.updateMeeting = async (req, res, next) => {
  const { headerConfig, params, body } = req;
  const { meetingId } = params;

  try {
    const request = await axios.patch(`${ZOOM_API_BASE_URL}/meetings/${meetingId}`, body, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.deleteMeeting = async (req, res, next) => {
  const { headerConfig, params } = req;
  const { meetingId } = params;

  try {
    const request = await axios.delete(`${ZOOM_API_BASE_URL}/meetings/${meetingId}`, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.getMeetingParticipantReport = async (req, res, next) => {
  const { headerConfig, params, query } = req;
  const { meetingId } = params;
  const { next_page_token } = query;

  try {
    const request = await axios.get(`${ZOOM_API_BASE_URL}/report/meetings/${meetingId}/participants?${qs.stringify({
      next_page_token,
    })}`, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}

exports.deleteMeetingRecordings = async (req, res, next) => {
  const { headerConfig, params, query } = req;
  const { meetingId } = params;
  const { action } = query;

  try {
    const request = await axios.delete(`${ZOOM_API_BASE_URL}/meetings/${meetingId}/recordings?${qs.stringify({ action })}`, headerConfig);
    return res.json({
      success: true,
      ...request.data
    });
  } catch (err) {
    return next(err)
  }
}
