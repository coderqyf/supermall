<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav" @titlesClick="titlesClick" ref="nav"></detail-nav-bar>

    <scroll class="content"
            ref="scroll"
            :probe-type="3"
            @scroll="contentScroll">

      <detail-swiper :top-images="topImages"></detail-swiper>
      <!--    <detail-swiper v-if="topImages!=''" :top-images="topImages"/>-->
      <detail-base-info :goods="goods"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo"  @imageLoad="imageLoad"></detail-goods-info>
      <detail-param-info ref="param" :param-info="paramInfo"></detail-param-info>
      <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
      <goods-list ref="recommend" :goods="recommends"></goods-list>
    </scroll>

    <detail-bottom-bar @addCart="addToCart"/>
    <back-top @click.native="backTop" v-show="isShowBackTop"></back-top>

<!--    <toast :message="message" :show="show"></toast>-->
  </div>
</template>

<script>
import detailNavBar from "@/views/detail/childComps/detailNavBar";
import DetailSwiper from "@/views/detail/childComps/DetailSwiper";
import DetailBaseInfo from "@/views/detail/childComps/DetailBaseInfo";
import DetailShopInfo from "@/views/detail/childComps/DetailShopInfo";
import DetailGoodsInfo from "@/views/detail/childComps/DetailGoodsInfo";
import DetailParamInfo from "@/views/detail/childComps/DetailParamInfo";
import DetailCommentInfo from "@/views/detail/childComps/DetailCommentInfo";
import DetailBottomBar from "@/views/detail/childComps/DetailBottomBar";

import BackTop from "@/components/content/backTop/BackTop";
import Scroll from "@/components/common/scroll/Scroll";
import GoodsList from "@/components/content/goods/GoodsList";

import {getDetail, Goods, Shop, GoodsParam, getRecommend} from "@/network/detail";
import {debounce} from "@/common/utils";
import {itemListenerMixin} from "@/common/mixin";

import { mapActions } from 'vuex'

// import Toast from "@/components/common/toast/Toast";

export default {
    name: "Detail",
    components: {
      detailNavBar,
      DetailSwiper,
      DetailBaseInfo,
      DetailShopInfo,
      DetailGoodsInfo,
      DetailParamInfo,
      DetailCommentInfo,
      DetailBottomBar,
      Scroll,
      GoodsList,
      BackTop,
      // Toast
    },
    mixins: [itemListenerMixin],
    data() {
      return {
        iid: null,
        topImages: [],
        goods: {},
        shop: {},
        detailInfo: {},
        paramInfo: {},
        commentInfo: {},
        recommends: [],
        itemImgListener: null,
        themeTopYs: [],
        getThemeTopY: null,
        currentIndex: 0,
        isShowBackTop: false,
        // message: '',
        // show: false,
      }
    },
    created() {
      //1.保存传入的iid
      this.iid =this.$route.params.iid

      //2.根据iid请求详情页
      getDetail(this.iid).then(res => {
        // console.log(res);
        //1.获取顶部轮播图数据
        const data = res.result;
        this.topImages = data.itemInfo.topImages

        //2.获取商品信息
        this.goods = new Goods(data.itemInfo, data.columns, data.shopInfo.services)

        //3.创建店铺信息
        this.shop = new Shop(data.shopInfo)

        //4.保存商品的详情数据
        this.detailInfo = data.detailInfo

        //5.获取参数信息
        this.paramInfo = new GoodsParam(data.itemParams.info, data.itemParams.rule)

        //6.取出评论信息
        if(data.rate.cRate !== 0) {
          this.commentInfo = data.rate.list[0]
        }
      })

      //3.请求推荐信息
      getRecommend().then(res => {
        // console.log(res);
        this.recommends = res.data.list
      })

      //4.给getThemeTopY赋值
      this.getThemeTopY = debounce(() => {
        this.themeTopYs = []
        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.param.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
        this.themeTopYs.push(Number.MAX_VALUE)
        console.log(this.themeTopYs);
      }, 100)
    },
  //和methods里的作用一致，另一侧在DetailGoodsInfo.vue里同步修改

    mounted() {
      const refresh = debounce(this.$refs.scroll.refresh, 50)
      this.itemImgListener = () => {
        refresh()
      }
      this.$bus.$on('imageLoad', this.itemImgListener)
    },
    deactivated() {
      this.$bus.$off('imageLoad', this.itemImgListener)
    },

    methods: {
      ...mapActions({
        add: 'addCart'
      }),
      imageLoad() {
        // this.$refs.scroll || this.$refs.scroll.refresh()
      },
      titlesClick(index) {
        // console.log(index);
        this.$refs.scroll.scrollTo(0, -this.themeTopYs[index], 200)
        // console.log('-------');
        this.getThemeTopY()
      },
      backTop() {
        console.log('backClick');
        this.$refs.scroll.scrollTo(0, 0)
      },
      contentScroll(position) {
        // console.log(position);
        //获取y值
        const positionY = -position.y
        // console.log(Number.MAX_VALUE);
        //positionY和主题中的值进行对比
        let length = this.themeTopYs.length
        for (let i = 0; i <length-1; i++) {
          if (this.currentIndex !== i && (positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1])) {
            this.currentIndex = i
            //   console.log(this.currentIndex);
              this.$refs.nav.currentIndex = this.currentIndex
          }

          this.isShowBackTop = (-position.y) > 1000

          // if (this.currentIndex !== i && ((i < length - 1 && positionY >= this.themeTopYs[i] && positionY < this.themeTopYs[i+1]) || (i === length-1 && positionY >= this.themeTopYs[i]))) {
          //   this.currentIndex = i
          //   console.log(this.currentIndex);
          //   this.$refs.nav.currentIndex = this.currentIndex
          // }
        }
      },
      addToCart() {
        // console.log('-------');
        //获取购物车需要展示的信息
        const product = {}
        product.image = this.topImages[0];
        product.title = this.goods.title;
        product.desc = this.goods.desc;
        product.price = this.goods.realPrice;
        product.iid = this.iid

        //将商品加入购物车
        // this.$store.cartList.push(product)
        // this.$store.commit('addCart', product)
        this.add(product).then(res => {
          // this.show = true
          // this.message = res;
          // // console.log(res);
          //
          // setTimeout(() => {
          //   this.show = false;
          //   this.message = ''
          // }, 1500)

          this.$toast.show(res, 2000)
        })


        // this.$store.dispatch('addCart', product).then(res => {
        //   console.log(res);
        // })

        //添加购物车成功

      }
    }
}
</script>

<style scoped>
  #detail {
    position: relative;
    z-index: 9;
    background-color: #fff;
    height: 100vh;
  }
  .content {
    height: calc(100% - 44px - 49px);
    overflow: hidden;
  }
  /*下面的样式于上面的overflow效果相同*/
  /*.detail-nav {*/
  /*  position: relative;*/
  /*  z-index: 9;*/
  /*  background-color: #fff;*/
  /*}*/

</style>