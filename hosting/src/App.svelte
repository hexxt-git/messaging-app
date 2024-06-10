<script lang="ts">
  import { db } from './lib/firebase';
  import { collection, getDocs } from 'firebase/firestore';

  let items: any = [];

  async function fetchItems() {
    const querySnapshot = await getDocs(collection(db, 'items'));
    items = querySnapshot.docs.map(doc => doc.data());
    console.table(items)
  }

  fetchItems();
</script>

<main>
  {JSON.stringify(items)}
</main>