<template>
  <div id="home">
    <nav-bar class="home-nav"><div slot="center">购物街</div></nav-bar>


    <tab-control :titles="['流行', '新款', '精选']"
                 @tabClick="tabClick"
                 ref="tabControl1" class="tab-control" v-show="isTabFixed"/>

        <scroll class="content"
                ref="scroll"
                :probe-type="3"
                @scroll="contentScroll"
                :pull-up-load="true" @pullingUp="loadMore">
          <home-swiper :banners="banners" @swiperImageLoad="swiperImageLoad"/>
          <recommend-view :recommends="recommends"/>
          <feature/>
          <tab-control :titles="['流行', '新款', '精选']"
                       @tabClick="tabClick"
                       ref="tabControl2"/>
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
  import {debounce} from "@/common/utils";
  import {itemListenerMixin} from "@/common/mixin";


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
      BackTop,
    },
    mixins: [itemListenerMixin],
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
        isShowBackTop: false,
        tabOffsetTop: 0,
        isTabFixed: false,
        saveY: 0,
        itemImgListener: null
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

    },
    destroyed() {
      console.log('home destroyed');
    },
    activated() {
      this.$refs.scroll.scrollTo(0, this.saveY, 0)

      this.$refs.scroll.refresh()
    },
    deactivated() {
      //1.保存Y值
      this.saveY = this.$refs.scroll.getScrollY()
      // console.log(this.saveY);
      //2.取消全局事件监听
      this.$bus.$off('itemImageLoad', this.itemImgListener)
    },
    mounted() {
      //等同于与Detail共用mixin
      // //1.图片加载完成的事件监听
      const refresh = debounce(this.$refs.scroll.refresh, 50)
      //
      // //2.对监听的事件进行保存
      this.itemImgListener = () => {
        refresh()
        // this.$refs.scroll && this.$refs.scroll.refresh()
      }
      this.$bus.$on('itemImageLoad', this.itemImgListener)
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
        this.$refs.tabControl1.currentIndex = index;
        this.$refs.tabControl2.currentIndex = index;
      },
      backClick() {
        console.log('backClick');
        this.$refs.scroll.scrollTo(0, 0)
      },
      contentScroll(position) {
        // 1.判断backTop是否显示
        this.isShowBackTop = (-position.y) > 1000

        //2.决定tabControl是否吸顶（position: fixed）
        this.isTabFixed = (-position.y) > this.tabOffsetTop
      },
      loadMore() {
        // console.log('加载更多的方法');
        this.getHomeGoods(this.currentType)
      },
      swiperImageLoad() {
        this.tabOffsetTop = this.$refs.tabControl2.$el.offsetTop;

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

          //完成上拉加载更多
          this.$refs.scroll.finishPullUp()
        })
      }
    }
  }
</script>

<style scoped>
  #home {
    /*和.home-nav里的一起使用*/
    /*padding-top: 44px;*/
    height: 100vh;
    position: relative;
  }

.home-nav {
  background-color: var(--color-tint);
  color: #fff;
  /*在使用浏览器原生滚动时，为了让导航不跟随一起滚动*/
  /*position: fixed;*/
  /*left: 0;*/
  /*right: 0;*/
  /*top: 0;*/
  /*z-index: 9;*/
}

  /*.tab-control {*/
  /*  position: sticky;!*粘性定位当鼠标键滑倒top位置时，自动停留*!*/
  /*  top: 44px;*/
  /*  z-index: 8;*/
  /*}*/
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

  .tab-control {
    position: relative;
    z-index: 9;
  }

</style>