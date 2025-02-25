import { useAppSelector } from '../../hooks/useReduxHooks';
import OvalButton from '../OvalButton/OvalButton';
import './Hero.css';
import ExternalLinkGradient from '../../images/ExternalLinkGradient';
import BTCB_SVG from '../../images/BTCB.svg';
import BTCB_64 from '../../images/btcb-64.png';
import BTCB_40 from '../../images/btcb-40.png';
import BTCB_128 from '../../images/btcb-128.png';
// import BTCB from '../../images/btcb.png';

const BorderText = ({ children }: { children: string }) => (
  <span className='border-only'>
    <span aria-hidden={true} className='over'>{children}</span>
    {children}
  </span>
);

export default function Hero() {
  const {
    primaryColor,
    secondaryColor,
    textColor,
    secondaryTextColor

  } = useAppSelector((store) => store.colors);
  return (
    <div className='hero'>
      <h1 className='header-text'>
        <BorderText>onchain</BorderText> wellness<br />
      </h1>
      <p className='header-text'>
        Powered by <img src={BTCB_128} alt='bitcoin on base' /> Bitcoin on base
      </p>
      <OvalButton
        onclick={() => { }}
        backgroundColor={secondaryColor}
        textColor={secondaryTextColor}
      >Coming soon</OvalButton>

      <section className='description'>
        <div className='description-header'>
          <h2 style={{ color: secondaryTextColor }}>The Future of Wellness</h2>
          <p>Take control of your mental health with secure, private, and personalized support—designed for today’s world. Onchain Wellness connects you with licensed therapists for 1:1 sessions, expert-led workshops, and TxAI, our revolutionary companion that rewards you for staying on track. Accessible, innovative, and built for you. Start your journey to better wellness today.</p>
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
