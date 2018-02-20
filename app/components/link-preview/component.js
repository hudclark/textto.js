import Ember from 'ember'
const autoLinker = new Autolinker({urls: true})

export default Ember.Component.extend({

    classNames: ['link-preview'],
    classNameBindings: ['visible'],
    api: Ember.inject.service(),

    didReceiveAttrs () {
        this._super(...arguments)
        const text = this.get('text')
        if (!text || text.length === 0) return
        const links = autoLinker.parse(text)
        if (links.length !== 1) return
        let link = links[0]
        link = DOMPurify.sanitize(link.url)
        if (!(link.startsWith('https://') || link.startsWith('http://'))) {
            link = 'https://' + link
        }

        if (this.get('link') !== link) {
            this.set('link', link)
            this.handleLink(link)
        }
    },

    handleLink (link) {
        // Is this link an image?
        if (/\.(gif|jpg|jpeg|tiff|png)$/i.test(link)) {

            this.loadImage(link)
        } else {
            this.loadUrl(link)
        }
    },

    loadImage (link) {
        this.set('imageLink', true)
        this.set('image', link)
    },

    loadUrl (link) {
        this.get('api').getLinkPreview(link)
            .then((response) => {
                const preview = response.preview
                if (!preview) return
                if (!(this.isDestroyed || this.isDestroying)) {
                    if (preview.image) {
                        preview.image = DOMPurify.sanitize(preview.image)
                    }
                    this.set('linkPreview', preview)
                    this.makeVisible()
                }
            })
            .catch((e) => console.log(e))
    },

    isInViewPort () {
        if (!this.$()) return false
        const delta = this.$().height() + this.$()[0].getBoundingClientRect().top
        return delta > -50
    },

    makeVisible () {
        this.set('visible', true)
        setTimeout(() => {
            if (!this.isInViewPort()) return
            const $messages = $('.messages')
            $messages.animate({
                scrollTop: `+=${this.$().outerHeight(true)}px`
            }, 0)
        }, 0)
    },

    actions: {

        imageLoaded (){
            this.makeVisible()
        }
    }


})