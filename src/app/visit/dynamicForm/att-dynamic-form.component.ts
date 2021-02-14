import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NotificationsComponent } from 'app/core/notification/notifications.component';
import { ErrorHandlerService } from 'app/core/error-handler.service';
import { MedicalRecordService } from '../medical-record.service';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DynamicFormQuestion } from 'app/model/DynamicFormQuestion';
import { Page, Pageable } from 'app/model/Util';
import { Response } from 'app/model/Response';
import { DynamicFormAnswered } from 'app/model/DynamicFormAnswered';

@Component({
    selector: 'app-att-dynamic-form',
    templateUrl: './att-dynamic-form.component.html'
})

export class AttDynamicFormComponent implements OnInit {

    public loading = false;
    public dynamicFormAnswered: DynamicFormAnswered;
    public dataNotFound: boolean;
    datas: Array<Response> = [];
    page: Page;
    pageSettings: Pageable;
    public formTitle: string;
    attendanceId: boolean;

    constructor(public principalService: MedicalRecordService, public confirmDialog: MatDialog, public dialog: MatDialog, public dialogRef: MatDialogRef<AttDynamicFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DynamicFormQuestion, public formBuilder: FormBuilder, private errorHandler: ErrorHandlerService, private notification: NotificationsComponent) {
        this.dialogRef.disableClose = true;
    }

    ngOnInit() {
        if (this.dialogRef.componentInstance.data['attendanceId'] !== null && this.dialogRef.componentInstance.data['form'] !== null) {
            this.page = new Page();
            this.pageSettings = new Pageable();
            this.pageSettings.size = 100;
            this.dynamicFormAnswered = new DynamicFormAnswered();
            this.attendanceId = this.dialogRef.componentInstance.data['attendanceId'];

            let resp = this.dialogRef.componentInstance.data['form'];
            this.formTitle = resp.title;
            resp.questions.forEach(item => {
                var response = new Response();
                response.dynamicFormQuestion = item;
                this.datas.push(response);
            })
            this.dynamicFormAnswered.documentTitle = this.formTitle;
            this.dynamicFormAnswered.listOfResponse = this.datas;
            this.page = resp;
            this.dataNotFound = this.datas.length === 0;
        } else {
            this.onCancelClick();
        }
    }

    onCancelClick(): void {
        this.dialogRef.close();
    }

    save() {
        this.dynamicFormAnswered.listOfResponse = this.dynamicFormAnswered.listOfResponse.filter(x => x.response != "" && x.response != null);
        this.loading = true;
        this.principalService.createDyanmicFormResponse(this.dynamicFormAnswered, this.attendanceId).then(resp => {
            this.loading = false;
            this.notification.showSucess("Formulário inserido com sucesso!");
            this.dialogRef.close();
        }).catch(error => {
            this.loading = false;
            this.errorHandler.handle(error, this.dialogRef);
        });

    }

    formValid() {

        return !this.dynamicFormAnswered.listOfResponse.some(x => x.response != "" && x.response != null);

    }

}
