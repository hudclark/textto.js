import Ember from 'ember'

export default Ember.Component.extend({

    bus: Ember.inject.service(),
    tagName: 'img-wrapper',
    classNameBindings: ['blur'],
    classNames: ['mms-image'],

    api: Ember.inject.service(),

    async didInsertElement() {
        this._super()

        let images = this.get('part')
        if (!(images.thumbnail && images.fullImage)) {
            const images = await this.get('api').getMmsImages(images._id)
        }

        if (this.isDestroyed || this.isDestroying) return

        this.set('src',  'data:image/png;base64,' + images.thumbnail)
        this.set('blur', true)

        const $fullImage = $('<img src="' + images.fullImage + '">')

        $fullImage[0].onload = () => {
            if (this.isDestroyed || this.isDestroying) return
            this.set('src', images.fullImage)
            this.set('blur', false)
        }
    },

    actions: {

        onClick() {
            let modal = {
                componentName: 'photo-modal',
                data: this.get('part.fullImage')
            };
            this.get('bus').post('openModal', modal);
        }

    }

})