export const Z = 'z'
export const Q = 'q'
export const S = 's'
export const D = 'd'
export const DIRECTIONS = [Z, Q, S, D]

const keyZElement = document.querySelector('.keyZ')
const keyQElement = document.querySelector('.keyQ')
const keySElement = document.querySelector('.keyS')
const keyDElement = document.querySelector('.keyD')
const keyShiftElement = document.querySelector('.keyShift')
const keyControlElement = document.querySelector('.keyControl')

export default class Utils
{
    constructor()
    {
        document.addEventListener('keydown', (event) =>
        {
            if(event.key == 'z')
            {
                keyZElement.classList.add('keyActive')
            }

            if(event.key == 'q')
            {
                keyQElement.classList.add('keyActive')
            }

            if(event.key == 's')
            {
                keySElement.classList.add('keyActive')
            }

            if(event.key == 'd')
            {
                keyDElement.classList.add('keyActive')
            }

            if(event.key == 'Shift')
            {
                if(keyShiftElement.matches('.keyActive'))
                {
                    keyShiftElement.classList.remove('keyActive')
                }

                else
                {
                    keyShiftElement.classList.add('keyActive')
                }
            }

            if(event.key == 'Control')
            {
                if(keyControlElement.matches('.keyActive'))
                {
                    keyControlElement.classList.remove('keyActive')
                }

                else
                {
                    keyControlElement.classList.add('keyActive')
                }
            }
        })

        document.addEventListener('keyup', (event) =>
        {
            if(event.key == 'z')
            {
                keyZElement.classList.remove('keyActive')
            }
        
            if(event.key == 'q')
            {
                keyQElement.classList.remove('keyActive')
            }
        
            if(event.key == 's')
            {
                keySElement.classList.remove('keyActive')
            }
        
            if(event.key == 'd')
            {
                keyDElement.classList.remove('keyActive')
            }
        })

        const buttonSoundElement = document.querySelector('.buttonSound')
        const audioObj = new Audio('./assets/sounds/god-of-war-ost.mp3')
        audioObj.volume = 0.08
        audioObj.pause()

        let count = 0

        buttonSoundElement.addEventListener('click', (event) =>
        {
            const buttonSoundActiveElement = document.querySelector('.buttonSoundActive')
            const buttonSoundDisableElement = document.querySelector('.buttonSoundDisable')

            buttonSoundActiveElement.classList.toggle('hidden')
            buttonSoundDisableElement.classList.toggle('hidden')

            if(count == 0)
            {
                count = 1
                audioObj.play()
            }
            else if(count == 1)
            {
                count = 0
                audioObj.pause()
                audioObj.currentTime = 0
            }
        })

    }
}