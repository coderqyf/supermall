<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>

        <scroll class="content"
                ref="scroll"
                :probe-type="3"
                @scroll="contentScroll"
                :pull-up-load="true">
          <home-swiper :banners="banners"/>
          <recommend-view :recommends="recommends"/>
          <feature/>
          <tab-control class="tab-control"
                       :titles="['流行', '新款', '精选']" @tabClick="tabClick"/>
          <goods-list :goods="showGoods"/>
        </scroll>

    <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>
  </div>
</template>

<script>
  import HomeSwiper from "@/views/home/childComps/HomeSwiper";
  import RecommendView from "@/views/home/childComps/RecommendView";
  import Feature from "@/views/home/childComps/Feature";

  import NavBar from "@/components/common/NavBar/NavBar";
  import TabControl from "@/components/content/tabControl/TabControl";
  import GoodsList from "@/components/content/goods/GoodsList";
  import Scroll from "@/components/common/scroll/Scroll";
  import BackTop from "@/components/content/backTop/BackTop";

  import {getHomeMultidata,getHomeGoods} from "@/network/home";


  export default {
    name: "Home",
    components: {
      HomeSwiper,
      RecommendView,
      Feature,
      NavBar,
      TabControl,
      GoodsList,
      Scroll,
      BackTop
    },
    data() {
      return {
        banners: [],
        recommends: [],
        goods: {
          'pop': {page: 0, list: []},
          'new': {page: 0, list: []},
          'sell': {page: 0, list: []}
        },
      currentType: 'pop',
        isShowBackTop: false
      }
    },
    computed: {
      showGoods() {
        return this.goods[this.currentType].list
      }
    },
    created() {
      //1.请求多个数据
      this.getHomeMultidata()//调用methods里的第一个getHomeMultidata

      //2.请求商品数据
      this.getHomeGoods('pop', 1)
      this.getHomeGoods('new', 1)
      this.getHomeGoods('sell', 1)

      //3.监听图片加载完成
      this.$bus.$on('itemImageLoad', () => {
        console.log('-----');
        this.$refs.scroll.refresh()
      })
    },
    methods: {
      /**
       *事件监听相关的方法
       */
      tabClick(index) {
        // console.log(index);//根据点击显示是新款，流行，还是精选
        switch (index) {
          case 0:
            this.currentType = 'pop'
            break
          case 1:
            this.currentType = 'new'
            break
          case 2:
            this.currentType = 'sell'
            break
        }
      },
      backClick() {
        console.log('backClick');
        this.$refs.scroll.scrollTo(0, 0)
      },
      contentScroll(position) {
        // console.log(position);
        this.isShowBackTop = (-position.y) > 1000
      },



      /**
       * 网络请求相关方法
       */
      getHomeMultidata() {
        getHomeMultidata().then(res => {
          // console.log(res);
          this.banners = res.data.banner.list
          this.recommends = res.data.recommend.list
        })
      },
      getHomeGoods(type) {
        const page = this.goods[type].page +1
        getHomeGoods(type, page).then(res => {
          // console.log(res);
          this.goods[type].list.push(...res.data.list)//是把res.data数组里的list依次拿出然后push到goods里的list中，这是es6的语法
          this.goods[type].page += 1//这个+1 是因为上面的page只是记录需要请求的页码，原本goods里的page没有改变，因此这里需要+1

        })
      }
    }
  }
</script>

<style scoped>
  #home {
    padding-top: 44px;
    height: 100vh;
    position: relative;
  }

.home-nav {
  background-color: var(--color-tint);
  color: #fff;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 9;
}
  .tab-control {
    position: sticky;/*粘性定位当鼠标键滑倒top位置时，自动停留*/
    top: 44px;
    z-index: 8;
  }
  .content {
    overflow: hidden;

    position: absolute;
    top: 44px;
    bottom: 49px;
    left: 0;
    right: 0;
  }

  /*和上面的.content二选一*/

  /*.content {*/
  /*  height: calc(100% - 44px);*/
  /*  overflow: hidden;*/
  /*  !*margin-top: 44px;*!*/
  /*}*/
</style>