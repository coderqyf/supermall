<template>
  <div class="wrapper" ref="wrapper">
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'

  export default {
    name: "scroll",
    props: {
      probeType: {
        type: Number,
        default: 0
      },
      pullUpLoad: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        scroll: null
      }
    },
    mounted() {
      //1.创建BScroll对象
      this.scroll = new BScroll(this.$refs.wrapper, {
        click: true,
        probeType: this.probeType,
        pullUpLoad: this.pullUpLoad
      })

      //2.监听滚动的位置
      if (this.probeType === 2 || this.probeType === 3) {
        this.scroll.on('scroll', position => {
          // console.log(position);  //监听滚动实时位置
          this.$emit('scroll', position)//自定义事件
        })
      }

      //3.监听上拉事件,scroll滚到底部
      if (this.pullUpLoad) {
        this.scroll.on('pullingUp', () => {
          // console.log('滚动到底部');
          this.$emit('pullingUp')
        })
      }
    },
    methods: {
      scrollTo(x, y, time= 300) {//x轴,y轴，300毫秒到达（x,y）
        this.scroll && this.scroll.scrollTo(x, y, time)
      },
      finishPullUp() {
         this.scroll && this.scroll.finishPullUp()
      },
      refresh() {
        // console.log('-------');
        this.scroll && this.scroll.refresh()
      },
      getScrollY() {
        return this.scroll ? this.scroll.y : 0
      }
    }
  }
</script>

<style scoped>

</style>