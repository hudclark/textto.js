import Ember from 'ember'
import ScrollMixin from '../../mixins/scroll'

export default Ember.Component.extend(ScrollMixin, {

    bus: Ember.inject.service(),
    encryption: Ember.inject.service(),
    tagName: 'img-wrapper',
    classNameBindings: ['blur'],
    classNames: ['mms-image'],

    api: Ember.inject.service(),

    retries: 0,

    didInsertElement() {
        this._super(...arguments)
        const thumbnail = this.get('part.thumbnail')
        this.set('src',  'data:image/png;base64,' + thumbnail)
        this.set('blur', true)
        if (this.isInViewPort()) {
            this.renderFullImage()
        } else {
            const id = this.get('elementId')
            this.bindScrolling({
                namespace: id,
                selector: '.messages',
                debounce: 50,
            })
        }
    },

    willDestoryElement() {
        this.unbindScrolling()
    },

    scrolled () {
        if (this.isInViewPort()) {
            this.unbindScrolling()
            this.renderFullImage()
        }
    },

    isInViewPort () {
        if (!this.$()) return false
        const delta = this.$().height() + this.$()[0].getBoundingClientRect().top
        return delta > -50
    },

    renderFullImage () {
        if (this.isFetching) {
            console.log('was already fetching')
            return
        }
        this.isFetching = true
        let images = this.get('part')
        this.isFetching = false
        if (this.isDestroyed || this.isDestroying) return

        if (this.get('encrypted')) {
            this.renderEncryptedImage(images.fullImage)
            return
        }

        const $fullImage = $('<img src="' + images.fullImage + '">')
        $fullImage[0].onload = () => {
            if (this.isDestroyed || this.isDestroying) return
            this.set('src', images.fullImage)
            this.set('blur', false)
        }
        $fullImage[0].onerror = (e) => {
            if (this.retries < 6) {
                this.retries++
                const timeout = 1000 * this.retries
                setTimeout(() => this.renderFullImage(), timeout)
            }
        }
    },

    renderEncryptedImage (url) {
        Ember.$.ajax(url)
            .then((response, statusCode, xhr) => {
                const encryption = this.get('encryption')
                return this.get('encryption').decrypt(response)
            })
            .then(plaintext => {
                this.set('src', 'data:' + this.get('contentType') + ';base64,' + plaintext)
                this.set('blur', 'false')
            })
            .catch(e => {
                if (e.status === 404 && this.retries < 4) {
                    this.retries++
                    const timeout = 1000 * this.retries
                    setTimeout(() => this.renderFullImage(), timeout)
                }
            })
    },

    actions: {

        onClick() {
            let modal = {
                componentName: 'photo-modal',
                data: this.get('src')
            };
            this.get('bus').post('openModal', modal);
        }

    }

})