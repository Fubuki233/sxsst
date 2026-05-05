import { useNavigate, NavigateOptions } from 'react-router';
import { transitionStore } from './transitionStore';

export function useBackNavigate() {
  const navigate = useNavigate();

  return (to: string, options?: NavigateOptions) => {
    transitionStore.setDirection('back');
    navigate(to, options);
  };
}
