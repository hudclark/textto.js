import Ember from 'ember'

export default Ember.Component.extend({

    tagName: 'img-wrapper',
    classNameBindings: ['blur'],
    classNames: ['mms-image'],

    api: Ember.inject.service(),

    async didInsertElement() {
        this._super()
        const images = await this.get('api').getMmsImages(this.get('partId'))
        if (this.isDestroyed || this.isDestroying) return

        this.set('src',  'data:image/png;base64,' + images.thumbnail)
        this.set('blur', true)

        const $fullImage = $('<img src="' + images.fullImage + '">')

        $fullImage[0].onload = () => {
            if (this.isDestroyed || this.isDestroying) return
            this.set('src', images.fullImage)
            this.set('blur', false)
        }
    }

})