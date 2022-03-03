import {debounce} from "@/common/utils";

export const itemListenerMixin = {
  mounted() {
    const refresh = debounce(this.$refs.scroll.refresh, 500)
    this.itemImgListener = () => {
      refresh()
    }
    this.$bus.$on('imageLoad', this.itemImgListener)
    // console.log('----混入mixin------');
  }
}