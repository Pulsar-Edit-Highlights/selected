
const { config } = atom;


module.exports = class StatusBarView {

    constructor (){

        this.removeElement = this.removeElement.bind(this);
        this.getElement = this.getElement.bind(this);

        this.element = document.createElement('div');

        this.element.classList
            .add('highlight-selected-status','inline-block');
    }

    updateCount ( count ){

        const statusBarString = config
            .get('highlight-selected.statusBarString');

        this.element.textContent =
            statusBarString.replace('%c',count);

        const { classList } = this.element;

        if( count > 0 )
            classList.remove('highlight-selected-hidden');
        else
            classList.add('highlight-selected-hidden');
    }

    getElement (){
        return this.element;
    }

    removeElement (){

        this.element.parentNode
            .removeChild(this.element);

        this.element = null;
    }
}
