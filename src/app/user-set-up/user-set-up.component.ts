import {Component, OnInit} from '@angular/core';

declare const $: any;

@Component({
    selector: 'app-user-set-up',
    templateUrl: './user-set-up.component.html',
    styleUrls: ['./user-set-up.component.css']
})
export class UserSetUpComponent implements OnInit {

    constructor() {

        $(function () {
            // $('.nav').hide();
        });
    }


    ngOnInit() {
    }

}
