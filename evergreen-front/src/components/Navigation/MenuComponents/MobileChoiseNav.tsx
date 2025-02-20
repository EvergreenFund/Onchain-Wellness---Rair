import React, { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../hooks/useReduxHooks';
import { BellIcon, SunIcon } from '../../../images';
import { setColorScheme } from '../../../redux/colorSlice';
import {
  SocialBox,
  UserIconMobile
} from '../../../styled-components/SocialLinkIcons/SocialLinkIcons';
import { rFetch } from '../../../utils/rFetch';
import { SvgUserIcon } from '../../UserProfileSettings/SettingsIcons/SettingsIcons';

interface IMobileChoiseNav {
  click: boolean;
  messageAlert: string | null;
  currentUserAddress: string | undefined;
  handleMessageAlert: (arg: string) => void;
  activeSearch: boolean;
  handleActiveSearch: () => void;
}

const MobileChoiseNav: React.FC<IMobileChoiseNav> = ({
  click,
  messageAlert,
  handleMessageAlert
}) => {
  const { primaryColor, headerLogoMobile, isDarkMode } = useAppSelector(
    (store) => store.colors
  );
  const { currentUserAddress } = useAppSelector((store) => store.web3);
  const dispatch = useAppDispatch();
  const { nickName, isLoggedIn, avatar } = useAppSelector(
    (state) => state.user
  );

  const { totalUnreadCount } = useAppSelector(store => store.notifications);
  console.log({ headerLogoMobile })

  return (
    <div className="burder-menu-logo">
      {click ? (
        <div> </div>
      ) : (
        <NavLink to="/dapp-lo0m1pa2k">
          <img src={headerLogoMobile} alt="Rair Tech" />
        </NavLink>
      )}
    </div>
  );
};

export default MobileChoiseNav;
