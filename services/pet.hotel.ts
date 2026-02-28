import PHService from '@/services/contract.service';
import { updateContract } from './event.service';
import { Alert } from 'react-native';
import { HOUR_EARLIER } from '@/constants/Constants';

export default class PetHotel extends PHService {
    button: {text: string, click: any, visible: boolean, serviceTime: number};
    rememberTime: number | undefined;
    hero: boolean
    block: boolean

    constructor (event: any, contract: any, user: any, token: string, isHero: boolean) {
        super(event, contract, token);
        console.log('PET WALK');
        this.setTrackeable(false);
        this.user = user;
        this.token = token;
        this.block = false;
        this.setBillingType(2);
        this.hero = isHero;
        this.setHero(isHero);
        this.button = {
            text:'', 
            click: () => {},
            visible: false, 
            serviceTime: 0
        };
        this.setTimeToStart(60 * HOUR_EARLIER); // minutes
        this.enums.notification = [
            {
            'title': `Start Service`,
            'body': `You have a pet hotel service soon`,
            },
            {
                'title': `Service Starting`,
                'body': `The service started now`,
            },
            {
                'title': `Service finalized`,
                'body': `The service was finalized now`,
            },
            {
                'title': `Payment billed`,
                'body': `You earned $${this.contract.price} for this service.`,
            },
        ]
    } 

    printTime = (time: number) => {
        time /= 1000;
        let answer = '';
        while (time > 0) {
            answer += `:${Math.floor(time/60)}`;
            time %= 60;
        }
        return answer.substring(1);
    }

    buttonText = () => {
        console.log('BUTTON TEXT', this.hero);
        const buttons: any = {
            'requested':  this.hero ? 'Start Service': 'Starting Soon',
            'started': this.hero ? 'End Service': 'Service started',
            'ended': this.hero ? 'Finalized': 'Review',
            'paid': 'Finalized',
            'finalized': 'Finalized'
        }
        return buttons[this.step];
    }
    
    buttonVisible = () => {
        console.log('BUTTON VISIBLE', this.hero);
        const buttons: any = {
            'requested': true,
            'started':  true,
            'ended': true,
            'paid': true,
            'finalized': false
        }
        return buttons[this.step];
    }

    buttonClick = () => {
        console.log('BUTTON CLICK', this.hero);
        const buttons: any = {
            'requested':  this.hero ? ['confirmToUpdateContract', 'Start Service?'] : [],
            'started': this.hero ? ['confirmToUpdateContract', 'End Service?']: [],
            'ended': this.hero ?  [] : ['updateContract'],
            'paid': ['seeDetail'],
            'finalized': []
        }
        return buttons[this.step];
    }

    confirmToUpdateContract = (message: string) => {
        console.log('CONFIRM TO UPDATE');
        // const timeToAccept = this.timeActivated();
        // if (!timeToAccept?.accepted && this.step === 'started') {
        //     Alert.alert(`Minimum Required time: ${this.printTime(this.minServiceTime)}`);
        //     return;
        // }        
        Alert.alert(
            message,
            "Are you sure you want to proceed?",
            [
                {
                text: "Cancel",
                style: "cancel",
                onPress: () => {
                    console.log("Action canceled");
                }
                },
                {
                text: "Confirm",
                onPress: async () => {
                    if (!this.block) {
                        this.block = true;
                        await this.updateContract();
                        setTimeout(() => {
                            this.block = false;
                        }, 300)
                    }                
                }
                }
            ],
            { cancelable: true }
        );
    }

    reviewContract = async() => {
        console.log('REVIEW CONTRACT');
    }

    updateContract = async () => {
        this.button.click = () => {};
        this.button.text = 'Wait!';
        for (const method of this.updateButton) {
            method(this.button);
        }
        await this.next();
        this.contract.step = this.step;
        this.contract.status = this.step;    
        if (this.step === 'started') {
            this.contract.serviceStart = new Date();
        } else if (this.step === 'ended') {
            this.contract.serviceEnd = new Date();
            this.contract.step = "ended";
            await updateContract(this.contract._id, {...this.contract, step: "ended"}, this.token);
            setTimeout(() => {
                const ob = this.addresses.get('payBill');
                ob();
            }, 10);
        } else if (this.step === 'paid') {
            this.contract.step = "paid";
            if (!this.contract?.serviceEnd) this.contract.serviceEnd = new Date();
            this.seeDetail();
        }
        let answer;
        setTimeout(async() => {
            answer = await updateContract(String(this.contract._id), {...this.contract}, this.token);
        }, 100);
        return answer;    
    }

    update = () => {
        this.button.text  = this.buttonText();
        this.button.visible  = this.buttonVisible();
        this.button.click = this.buttonClick();
        
        for (const method of this.updateButton) {
            method(this.button);         
        } 
    }

    seeDetail = () => {
        const de = this.addresses.get('detail');
        de();
    }
}