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
            this.set('showButton', true)
            this.set('visible', true)
        }
    },

    loadPreview (link) {
        this.set('isLoading', true)
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
        this.set('isLoading', false)
    },

    loadUrl (link) {
        this.get('api').getLinkPreview(link)
            .then((response) => {
                const preview = response.preview
                if (!preview) {
                    this.set('isLoading', false)
                    this.set('visible', false)
                    return
                }
                if (!(this.isDestroyed || this.isDestroying)) {
                    if (preview.image) {
                        preview.image = DOMPurify.sanitize(preview.image)
                    }
                    this.set('linkPreview', preview)
                    this.onLoaded()
                    this.set('isLoading', false)
                }
            })
            .catch((e) => {
                console.log(e)
                this.set('isLoading', false)
            })
    },

    isInViewPort () {
        if (!this.$()) return false
        const delta = this.$().height() + this.$()[0].getBoundingClientRect().top
        return delta > -50
    },

    onLoaded () {
        this.set('loaded', true)
        setTimeout(() => {
            const $messages = $('.messages')[0]
            const delta = Math.abs($messages.scrollHeight - $messages.scrollTop - $messages.clientHeight)

            if (delta < this.$().outerHeight(true)) {
                $('.messages').scrollTop($messages.scrollHeight)
            }
        }, 100)
    },

    actions: {

        imageLoaded (){
            this.onLoaded()
        },

        showPreview () {
            this.set('showButton', false)
            this.set('isLoading', true)
            this.loadPreview(this.get('link'))
        }
    }


})