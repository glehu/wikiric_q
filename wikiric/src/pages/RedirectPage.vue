<script>
export default {
  name: 'RedirectPage',
  mounted () {
    this.gotoRedirect()
  },
  methods: {
    gotoRedirect: function () {
      const redirect = this.$route.query.redirect
      if (redirect) {
        let url = redirect
        const backref = this.$route.query.backref
        if (backref) {
          url += `&backref=${backref}`
        }
        const backrefurl = this.$route.query.backrefurl
        if (backrefurl) {
          url += `&backrefurl=${backrefurl}`
        }
        const course = this.$route.query.course
        if (course) {
          url += `&course=${course}`
        }
        const chapter = this.$route.query.chapter
        if (chapter) {
          url += `&chapter=${chapter}`
        }
        this.$router.replace(url)
      } else {
        this.$router.replace('/404')
      }
    }
  }
}
</script>

<template>
  <div></div>
</template>

<style scoped>

</style>
