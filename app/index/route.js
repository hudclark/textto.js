import Ember from 'ember'

export default Ember.Route.extend({

    actions: {

        didTransition () {
            const onAppear = function (id) {
                $(id).addClass('visible')
            }
            Ember.run.scheduleOnce('afterRender', this, function () {
                const options = []
                const elements = $('.appearing')
                elements.each(function (i) {
                    const width = Math.max((this.width / 2), 200)
                    const id = '#' + this.id
                    options.push({
                        selector: id,
                        offset: width,
                        callback: function () { onAppear(id) }
                    })
                })
                console.log(options)
                Materialize.scrollFire(options)
            })
        }
    }

})