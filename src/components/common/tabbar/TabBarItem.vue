<template>
  <div class="tab-bar-item" @click="itemClick">

    <div v-if="!isActive"><slot name="item-icon"></slot></div>
    <div v-else><slot name="item-icon-active"></slot></div>
<!--    <div :class="{active: isActive}"><slot name="item-text"></slot></div>-->
    <div :style="activeStyle"><slot name="item-text"></slot></div>


<!--    <img src="../../assets/img/tabbar/home.svg" alt="">-->
<!--    <div>首页</div>-->
  </div>
</template>

<script>
  export default {
    name: "TabBarItem",
    props: {
      path: String,
      activeColor: {
        type:String,
        default: 'red'
      }
    },
    data() {
      return {
        //isActive: true,
      }
    },
    computed: {
      isActive() {
        return this.$route.path.indexOf(this.path)   !==  -1
      },
      activeStyle() {
        return this.isActive ? {color: this.activeColor} : {}
      }
    },
    methods: {
      itemClick() {
        console.log('itemClick');
       this.$router.replace(this.path)

      }
    }
  }
</script>

<style scoped>
  .tab-bar-item {
    flex: 1;  /*  弹性盒子布局*/
    text-align: center;
    height: 49px;
    font-size: 14px;
  }

  .tab-bar-item img {
    width: 24px;
    height: 24px;
    margin-top: 3px;  /*顶部的距离*/
    vertical-align: middle;  /*  使两个属性之间没有空格*/
    margin-bottom: 2px;  /*  下外边框距*/

  }

  /*.active {*/
  /*  color: red;*/
  /*}*/
</style>