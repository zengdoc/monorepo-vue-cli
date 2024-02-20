<template>
  <div id="app">
    <h1>Project1</h1>
    <Header/>
    <Common/>
  </div>
</template>

<script>
  import Header from '@/views/Header'
  import Common from '@/components/Common'

  export default {
    name: 'App',
    components: {
      Header,
      Common,
    },
  }
</script>
