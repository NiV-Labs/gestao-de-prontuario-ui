import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AttendanceService } from 'app/attendance/attendance.service';
import { ErrorHandlerService } from 'app/core/error-handler.service';
import { NotificationsComponent } from 'app/core/notification/notifications.component';
import { UtilService } from 'app/core/util.service';
import { Accommodation } from 'app/model/Accommodation';
import { NewAttendanceEvent } from 'app/model/Attendance';
import { EventType } from 'app/model/EventType';
import { ProcedureFilters, ProcedureInfo } from 'app/model/Procedure';
import { Professional } from 'app/model/Professional';
import { Sector, SectorFilters } from 'app/model/Sector';
import { Pageable } from 'app/model/Util';
import { ProcedureService } from 'app/procedure/procedure.service';
import { SectorService } from 'app/sector/sector.service';
import { MedicalRecordService } from '../medical-record.service';

@Component({
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.css']
})
export class NewEventComponent implements OnInit {


  loading = false;

  eventTypeControl = new FormControl('10', [Validators.required]);
  sectorControl = new FormControl('', [Validators.required]);
  accommodationControl = new FormControl('', [Validators.required]);
  responsibleControl = new FormControl('', [Validators.required]);
  procedureControl = new FormControl('');

  responsibles: Array<Professional> = [];
  sectors: Array<Sector> = [];
  accommodations: Array<Accommodation> = [];

  dataToForm: NewAttendanceEvent;

  sectorFilters = new SectorFilters();
  setorPageSettings = new Pageable();


  constructor(
    public dialogRef: MatDialogRef<NewEventComponent>,
    public attendanceService: AttendanceService,
    public sectorService: SectorService,
    public notification: NotificationsComponent,
    public utilService: UtilService,
    public visitService: MedicalRecordService,
    public medicalRecService: MedicalRecordService,
    public procedureService: ProcedureService,
    private errorHandler: ErrorHandlerService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit(): void {
    const data = this.dialogRef.componentInstance.data;
    if (this.dialogRef.componentInstance.data) {
      this.dataToForm = new NewAttendanceEvent();
      this.dataToForm.attendanceId = data.attendanceId;
      this.dataToForm.accommodation = data.lastAccommodation ? data.lastAccommodation : new Accommodation();
      this.dataToForm.eventType = new EventType();
      this.dataToForm.documents = [];
      this.dataToForm.responsible = new Professional();
      this.dataToForm.procedure = new ProcedureInfo();
    }
    this.loadSectors();
    this.procedureControl.registerOnChange((value) => {
      this.dataToForm.procedure.id = value;
    });
  }


  /**
   * Busca os setores e seleciona o primeiro encontrado
   */
  loadSectors() {
    if (this.sectors?.length) {
      this.sectorControl.setValue(this.sectors[0].id);
      var event = { value: this.dataToForm.accommodation.sectorId };
      this.loadAccommodations(event);
    } else {
      this.loading = true;
      this.sectorService.getPage(this.sectorFilters, this.setorPageSettings).then(response => {
        this.sectors = response.content;
        this.sectorControl.setValue(this.dataToForm.accommodation.sectorId);
        var event = { value: this.dataToForm.accommodation.sectorId };
        this.loadAccommodations(event);
      }).catch(e => this.errorHandler.handle(e, this.dialogRef))
        .then(() => this.loading = false);
    }
  }


  /**
   * Busca as acomodações à partir do identificador do setor
   * 
   * @param event Evento de change do Select
   */
  loadAccommodations(event: any) {
    var sectorId = event.value;
    if (sectorId) {
      this.loading = true;
      this.sectorService.getById(sectorId).then(response => {
        this.accommodations = response.listOfRoomsOrBeds;
        if (this.accommodations.length)
          this.accommodationControl.setValue(this.accommodations[0].id);
      }).catch(e => {
        this.accommodations = [];
        this.errorHandler.handle(e, this.dialogRef);
      }).then(() => this.loading = false);
    }
  }

  /**
   * Seleciona acomodação para o evento
   * 
   * @param id Identificador único da acomodação
   */
  selectAccommodation(id: number) {
    if (id) {
      this.dataToForm.accommodation.id = id;
    }
  }

  /**
   * Seleciona o tipo do evento
   * 
   * @param id Identificador único do tipo de evento
   */
  selectEventType(id: number) {
    if (id) {
      this.dataToForm.eventType.id = id;
    }
  }

  /**
   * Busca procedimento por ID
   */
  searchProcedureById(event: any) {
    if (event.key === "Enter") {
      event.preventDefault();
      var id = this.dataToForm?.procedure?.id;
      if (id) {
        var procedureFilter = new ProcedureFilters();
        procedureFilter.id = id.toString();


        this.loading = true;
        this.procedureService.getPage(procedureFilter, new Pageable()).then(resultPage => {
          if (resultPage && resultPage.content.length) {
            this.dataToForm.procedure = resultPage.content[0];
          } else {
            this.notification.showWarning('Procedimento com o código ' + id + ' não encontrado');
          }
        }).then(() => this.loading = false);
      }
    }
  }

  /**
   * Cria um evento de prontuário
   * 
   * @param closeDialog Define se mantém o componente aberto ou fechado após o processo de criação de evento
   */
  createEvent(closeDialog: boolean) {
    this.loading = true;
    this.medicalRecService.createAttendanceEvent(this.dataToForm).then(resp => {
      if (closeDialog) {
        this.dialogRef.close();
      } else {
        this.ngOnInit();
      }
      this.notification.showSucess("Evento criado com sucesso!");
    }).catch(e => this.errorHandler.handle(e, null))
      .then(() => this.loading = false);

  }

}
