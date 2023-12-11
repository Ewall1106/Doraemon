import { Button } from '@mantine/core';
import styles from './styles.module.scss';

export default function Home() {
  return (
    <div className={styles.home}>
      <Button variant="filled">Home</Button>
    </div>
  );
}
