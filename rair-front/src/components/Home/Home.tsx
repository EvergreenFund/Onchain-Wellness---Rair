import React, { useCallback, useEffect, useState } from 'react'
import Hero from '../Hero/Hero'
import OvalButton from '../OvalButton/OvalButton'
import { useAppSelector } from '../../hooks/useReduxHooks';
import './Home.css';
import BlockButton from '../BlockButton/BlockButton';
import Badge from '../Badge/Badge';
import IndividualTherapyImage from '../../images/individualTherapyImage.png';
import WorkshopsImage from '../../images/workshopImage.png';
import ExternalLink from '../../images/ExternalLink';
import Popup from 'reactjs-popup';
import MintPopUpCollection from '../MockUpPage/NftList/NftData/TitleCollection/MintPopUpCollection/MintPopUpCollection';
import { TOfferType } from '../marketplace/marketplace.types';
import axios, { AxiosError } from 'axios';
import { IOffersResponseType, TProducts } from '../../axios.responseTypes';

const Home = () => {
  const {
    primaryColor,
    secondaryColor,
    textColor,
    secondaryTextColor
  } = useAppSelector((store) => store.colors);
  // const { contract, tokenId, blockchain } = useParams<TParamsTitleCollection>();
  const contract = '0x4c72cfefc42acc019f6304598336a2e21da8a4ad'
  const blockchain = '0x2105'
  const [mintPopUp, setMintPopUp] = useState<boolean>(false);
  const mockOffers: TOfferType[] = [ { contract: "0x1234567890abcdef", copies: 100, creationDate: "2025-01-10T14:19:00Z", diamond: true, offerIndex: "1", offerName: "Exclusive NFT Art", offerPool: "Art Pool", price: "2.5 ETH", product: "Digital Art", range: ["0x1", "0x2", "0x3"], sold: false, soldCopies: 0, transactionHash: "0xabcdef1234567890", _id: "offer1", diamondRangeIndex: "0x1", hidden: false, sponsored: true }, { contract: "0xabcdef1234567890", copies: 50, creationDate: "2025-01-09T10:00:00Z", diamond: false, offerIndex: "2", offerName: "Limited Edition NFT", offerPool: "Collectibles Pool", price: "1.0 ETH", product: "Collectible", range: ["0x4", "0x5"], sold: true, soldCopies: 50, transactionHash: "0x1234567890abcdef", _id: "offer2", hidden: false }, { contract: "0x7890abcdef123456", copies: 200, creationDate: "2025-01-08T08:30:00Z", diamond: true, offerIndex: "3", offerName: "Rare NFT Collection", offerPool: "Rare Pool", price: "5.0 ETH", product: "Digital Collectible", range: ["0x6", "0x7", "0x8", "0x9"], sold: false, soldCopies: 0, transactionHash: "0xabcdef7890123456", _id: "offer3", diamondRangeIndex: "0x6", hidden: true, sponsored: false } ];
  const [purchaseStatus, setPurchaseStatus] = useState<boolean>(false);
    const [collectionName, setCollectionName] = useState<string>();
  const [offerPrice, setOfferPrice] = useState<string[] | undefined>([]);
  const [offerData, setOfferData] = useState<TOfferType>();
  const [offerDataInfo, setOfferDataInfo] = useState<TOfferType[]>();
  const [ownerInfo, setOwnerInfo] = useState<TProducts>();
  const [dataForUser, setDataForUser] = useState<TProducts>();
  const [selectedOfferIndex, setSelectedOfferIndex] = useState<string>();

    const getParticularOffer = useCallback(async () => {
    try {
      const response = await axios.get<IOffersResponseType>(
        `/api/nft/network/${blockchain}/${contract}/${0}/offers`
      );

      if (response.data.success) {
        setDataForUser(response.data.product);
        setOfferData(
          response.data.product.offers?.find((neededOfferIndex) => {
            if (neededOfferIndex && neededOfferIndex.diamond) {
              return neededOfferIndex.diamondRangeIndex === selectedOfferIndex;
            } else {
              return neededOfferIndex.offerIndex === selectedOfferIndex;
            }
          })
        );

        setOfferPrice(
          response.data.product.offers?.map((p) => {
            return p.price.toString();
          })
        );

        setOwnerInfo(response.data.product);
        setOfferDataInfo(response.data.product.offers);
        setCollectionName(response.data.product.name);
      }
    } catch (err) {
      const error = err as AxiosError;
      console.error(error?.message);
    }
  }, [contract, selectedOfferIndex, blockchain]);

    useEffect(() => {
      getParticularOffer();
    }, [getParticularOffer]);

  return (
    <div
      className='home'
      style={{
        marginTop: "100px"
    }}>
      <section className='home-section hero'>
        <Hero />
      </section>
      <Popup
        className="popup-settings-block"
        open={mintPopUp}
        position="right center"
        closeOnDocumentClick
        onClose={() => {
          setMintPopUp(false);
        }}>
          <MintPopUpCollection
            blockchain={blockchain}
            offerDataCol={offerDataInfo}
            primaryColor={primaryColor}
            contractAddress={contract}
            setPurchaseStatus={setPurchaseStatus}
          />
      </Popup>
      <div
        className='wide-banner'
        style={{
          color: secondaryTextColor
        }}
      >
        <h2>Let’s Personalize Your Wellness Experience</h2>
        <OvalButton
          onclick={() => {}}
          backgroundColor={secondaryTextColor}
          textColor={primaryColor}
        >
          <span
            style={{
              background: secondaryColor,
              color: 'transparent',
              WebkitBackgroundClip: 'text',
            }}
          >Assessment</span>
        </OvalButton>
      </div>
      <section className='home-section subscription-plans'>
        <header className='plans-header' style={{ color: secondaryTextColor }}>
          <h6>GET ACCESS</h6>
          <h2>Our suscriptions <span style={{
                  background: secondaryColor,
                  color: 'transparent',
                  WebkitBackgroundClip: 'text',
                }}>plans</span></h2>
        </header>
        <div className='plans-container'>
          <article className='plan-item'>
            <div className='plan-card'>
              <strong
                className='plan-price'
                style={{
                  background: secondaryColor,
                  color: 'transparent',
                  WebkitBackgroundClip: 'text',
                }}
              >$5</strong>
              <h3
                style={{
                  color: secondaryTextColor
                }}
              >Standard Plan</h3>
              <ul className='plan-features'>
                <li>Full access to Workshop & Courses</li>
                <li>Access to TxAI</li>
                <li>Unlimited access to Live Group Sessions</li>
                <li>Tokenized Rewards for Engagement</li>
              </ul>
            </div>
            <div className='plan-card-footer'>
              <BlockButton onclick={() => setMintPopUp(true)} backgroundColor={secondaryColor} textColor={secondaryColor}>
                <span style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>Join now <ExternalLink width={16} height={16} /></span>
              </BlockButton>
            </div>
          </article>
          <article className='plan-item'>
            <div className='plan-card'>
              <strong
                className='plan-price'
                style={{
                  background: secondaryColor,
                  color: 'transparent',
                  WebkitBackgroundClip: 'text',
                }}
              >$420</strong>
              <h3
                style={{
                  color: secondaryTextColor
                }}
              >Premium Plan</h3>
              <ul className='plan-features'>
                <li>1:1 Therapy Sessions</li>
                <li>Access to TxAI</li>
                <li>Full access to all Workshop & Courses</li>
                <li>Customized Recovery Plan</li>
                <li>Tokenized Rewards for Engagement</li>
              </ul>
            </div>
            <div className='plan-card-footer'>
              <BlockButton onclick={() => {}} backgroundColor={secondaryColor} textColor={secondaryColor}>
                <span style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>Join now <ExternalLink width={16} height={16} /></span>
              </BlockButton>
            </div>
          </article>
        </div>
      </section>
      <section className='home-section individual-therapy-section'>
        <div className='individual-therapy-container'>
            <h2 style={{ color: secondaryTextColor }}>Individual Therapy</h2>
            <p>Experience personalized, one-on-one support with licensed therapists who specialize in addressing the unique challenges of modern life. Whether you're navigating stress, trauma, relationships, or career-related issues, our therapists provide a safe, confidential space to explore your concerns and work toward meaningful growth.</p>
            <div
              className='individual-therapy-features'
            >
                <div className='individual-therapy-feature'>
                  <Badge><h4>Personalized Care</h4></Badge> 
                  <p>Sessions tailored to your unique goals and challenges, ensuring a focused and impactful therapeutic experience.</p>
                </div>
                <div className='individual-therapy-feature'>
                  <Badge><h4>Privacy First</h4></Badge>
                  <p>Leverage blockchain technology for secure and private session bookings, protecting your identity and data.</p>
                </div>
                <div className='individual-therapy-feature'>
                  <Badge><h4>Tokenized Rewards</h4></Badge>
                  <p>Earn wellness tokens for active participation in therapy, workshops, and other activities, recognizing your commitment to mental well-being.</p>
                </div>
            </div>
            <div>
              <img
                src={IndividualTherapyImage} 
                alt="individual therapy image"
                width={500}
              />
            </div>
        </div>

      </section>
      <section className='home-section workshops-section'>
        <h2 style={{ color: secondaryTextColor }}>Workshops</h2>
        <div className='workshops-container'>
          <div>
            <img
              src={WorkshopsImage} 
              alt="workshop image"
              width={500}
            />
          </div>
          <div
            className='workshops-steps'
          >
              <div className='step-item'>
                <div>
                  <h4>Expert Led Sessions</h4>
                  <p>Discover valuable insights and transformative strategies from top professionals and visionary thought leaders at the intersection of crypto and wellness.</p>
                </div>
                <div className= 'badge-container'>
                  <Badge fullRounded>
                    <strong className='step-number'>1</strong>
                  </Badge>
                </div>
              </div>
              <div className='step-item'>
                <div>
                  <h4>Interactive Learning</h4>
                  <p>Participate in live, collaborative workshops designed to foster connection, resilience, and personal growth.</p>
                </div>
                <div className= 'badge-container'>
                  <Badge fullRounded>
                    <strong className='step-number'>2</strong>
                  </Badge>
                </div>
              </div>
              <div className='step-item'>
                <div>
                  <h4>Onchain Integration</h4>
                  <p>Access workshops securely through decentralized platforms, ensuring privacy and streamlined participation.</p>
                </div>
                <div className= 'badge-container'>
                  <Badge fullRounded>
                    <strong className='step-number'>3</strong>
                  </Badge>
                </div>
              </div>
              <div className='step-item'>
                <div>
                  <h4>Earn Through Participation</h4>
                  <p>Receive rewards for completing workshops and participating in our Wellness Ecosystem, celebrating your commitment to mental health and continuous learning.</p>
                </div>
                <div className= 'badge-container'>
                  <Badge fullRounded>
                    <strong className='step-number'>4</strong>
                  </Badge>
                </div>
              </div>
          </div>
        </div>
      </section>
      <section className='home-section q-a-section'>
        <h2 style={{ color: secondaryTextColor }}>Frequently Asked Questions</h2>
        <div className='q-a-container'>
            <details>
              <summary>Built by Degens for Degens</summary>
              <p>At Onchain Wellness, we understand the unique challenges faced by the crypto and Web3 communities because we’re part of it. "Built by Degens, for Degens" reflects our commitment to creating a platform tailored to the fast-paced, high-stakes world of decentralized work and trading. We’ve designed our services with your needs in mind—whether it’s maintaining privacy, managing stress, or finding balance in an always-on environment. As members of this community, we’re here to support your mental health while speaking your language.</p>
            </details>
            <details>
              <summary>Why are we building Onchain?</summary>
              <p>Onchain Wellness is designed to leverage blockchain technology to address critical challenges in mental health care: privacy, accessibility, and trust. By building onchain, we ensure user data is secure, transactions are transparent, and identities remain private, creating a safe space for individuals to seek support without fear of stigma. This decentralized approach empowers users with full control over their mental health journey.</p>
            </details>
            <details>
              <summary>How does Onchain Wellness ensure my privacy and security?</summary>
              <p>Our platform prioritizes privacy through decentralized identity systems, blockchain-based authentication, and end-to-end encryption. This means your data stays under your control, and sensitive information is never shared or stored in vulnerable centralized databases. All telehealth and AI therapy sessions adhere to HIPAA compliance for added security.</p>
            </details>
            <details>
              <summary>What makes Onchain Wellness different from traditional therapy platforms?</summary>
              <p>Onchain Wellness stands out by combining the best of mental health care with cutting-edge Web3 technology. We prioritize privacy with decentralized identity management, making sure your personal data stays in your control. Our services are designed to meet the needs of modern, decentralized teams and crypto professionals, offering 1:1 therapy, expert-led workshops, and  AI Therapy.</p>
            </details>
        </div>
      </section>
    </div>
  )
}

export default Home