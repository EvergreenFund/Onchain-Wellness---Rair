import React from 'react'
import Hero from '../Hero/Hero'
import OvalButton from '../OvalButton/OvalButton'
import { useAppSelector } from '../../hooks/useReduxHooks';
import './Landing.css';
import BlockButton from '../BlockButton/BlockButton';
import Badge from '../Badge/Badge';
import IndividualTherapyImage from '../../images/individualTherapyImage.png';
import WorkshopsImage from '../../images/workshopImage.png';
import ExternalLink from '../../images/ExternalLink';

const Landing = () => {
  const {
    primaryColor,
    secondaryColor,
    textColor,
    secondaryTextColor
  } = useAppSelector((store) => store.colors);

  return (
    <div
      className='home'
      style={{
        marginTop: "100px"
    }}>
      <section className='home-section hero'>
        <Hero />
      </section>
    </div>
  )
}

export default Landing