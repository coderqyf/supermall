<template>
  <div class="goods">
    <goods-list-item v-for="item in goods" :goods-item="item"/>
<!--    {{goods}}-->
  </div>
</template>

<script>
  import GoodsListItem from "@/components/content/goods/GoodsListItem";

  export default {
    name: "GoodsList",
    components: {
      GoodsListItem
    },
    props: {
      goods: {
        type: Array,
        default() {
          return []
        }
      }
    }
  }
</script>

<style scoped>
  .goods {
    display: flex;
    flex-wrap: wrap;
    /*给精选页面的小组件设置均等分，*/
    justify-content: space-evenly;
    padding: 2px;
  }

</style>