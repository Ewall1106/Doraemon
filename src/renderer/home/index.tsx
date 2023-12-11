import { Button } from '@mantine/core';
import styles from './styles.module.scss'

export const Home = () => {
  return (
    <div className={styles.home}>
      <Button variant="filled">Home</Button>
    </div>
  );
};

export default Home;
