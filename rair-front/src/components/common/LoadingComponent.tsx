import { CircularProgress } from '@mui/material';

import { useAppSelector } from '../../hooks/useReduxHooks';

const LoadingComponent = ({ size = 100, classes = 'list-wrapper-empty' }) => {
  const { iconColor, secondaryColor } = useAppSelector((store) => store.colors);

  return (
    <div className={classes}>
      {import.meta.env.VITE_TESTNET === 'true' ? (
        <CircularProgress
          sx={{ color: `${iconColor === '#1486c5' ? '#F95631' : secondaryColor}` }}
          size={size}
          thickness={4.6}
        />
      ) : (
        <CircularProgress
          sx={{ color: `${iconColor === '#1486c5' ? '#E882D5' : secondaryColor }` }}
          size={size}
          thickness={4.6}
        />
      )}
    </div>
  );
};

export default LoadingComponent;
