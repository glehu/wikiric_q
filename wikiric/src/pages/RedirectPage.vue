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
        const backref = this.$route.query.backref
        let url = redirect
        if (backref) {
          url += `&backref=${backref}`
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
