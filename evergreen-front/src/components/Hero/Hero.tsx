import { useAppSelector } from '../../hooks/useReduxHooks';
import OvalButton from '../OvalButton/OvalButton';
import './Hero.css';
import ExternalLinkGradient from '../../images/ExternalLinkGradient';
import BTCB from '../../images/BTCB.svg';


export default function Hero() {
  const {
    primaryColor,
    secondaryColor,
    textColor,
    secondaryTextColor

  } = useAppSelector((store) => store.colors);
  return (
    <div className='hero'>
      <h1 style={{ color: secondaryTextColor }}>
        <span className='border-only'><span aria-hidden={true} className='over'>onchain</span>onchain</span> wellness<br />
        for <span className='border-only'><span aria-hidden={true} className='over'>a</span>a</span> <span className='border-only' style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span aria-hidden={true} className='over' style={{ display: 'inline-flex', alignItems: 'center' }}><img src={BTCB} alt="B" style={{ height: '0.82em', verticalAlign: 'text-bottom' }} />etter</span>
          <img src={BTCB} alt="B" style={{ height: '0.82em', verticalAlign: 'text-bottom' }} />etter
        </span> future
      </h1>
      <OvalButton
        onclick={() => { }}
        backgroundColor={secondaryColor}
        textColor={secondaryTextColor}
      >Coming soon</OvalButton>

      <section className='description'>
        <div className='description-header'>
          <h2 style={{ color: secondaryTextColor }}>The Future of Wellness</h2>
          <p> Empowering individuals with secure, private, and personalized mental health support, Onchain Wellness redefines care for the modern, decentralized world. Our platform offers 1:1 individual therapy with licensed professionals, expert-led workshops by industry thought leaders, as well as TxAI, a groundbreaking digital wellness companion that rewards users for engaging in healthy behaviors. Accessible, innovative, and tailored to your unique journey, we're here to support you every step of the way.</p>
        </div>

        <div
          className='description-features'
        >
          <article>
            <h4><ExternalLinkGradient /> 1:1 Individual Therapy</h4>
            <p>Personalized, confidential support with licensed professionals to address your unique needs.</p>
          </article>
          <article>
            <h4><ExternalLinkGradient /> AI Assisted Therapy</h4>
            <p>Introducing TxAI, your customizable wellness companion, offering on-demand, private mental health support while rewarding you with incentives for building and maintaining healthy habits.</p>
          </article>
          <article>
            <h4><ExternalLinkGradient /> Workshops</h4>
            <p>Expert-led sessions focused on resilience, healing, and growth in a collaborative environment.</p>
          </article>

        </div>
      </section>

    </div>
  );
};
