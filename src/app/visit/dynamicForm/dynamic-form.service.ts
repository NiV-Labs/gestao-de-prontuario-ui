import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppHttp } from '../../security/app-http';
import { Page, Pageable } from 'app/model/Util';
import { DynamicForm, DynamicFormFilter } from 'app/model/DynamicForm';
import { DynamicFormQuestion } from 'app/model/DynamicFormQuestion';
import { HttpHeaders } from '@angular/common/http';

@Injectable()
export class DynamicFormService {

    resourceUrl: string;
    token: string;

    constructor(private http: AppHttp) {
        this.resourceUrl = `${environment.apiUrl}/dynamic-form`;
    }

    /**
     * Busca uma página de formulários
     * @param pageSettings Configurações de paginação
     */
    getPageOfForms(filters: DynamicFormFilter, pageSettings: Pageable): Promise<Page> {

        var queryString;
        if (filters) {
            let params = new URLSearchParams();
            for (let key in filters) {
                if (filters[key]) {
                    params.set(key, filters[key])
                }
            }
            queryString = params.toString();
        }
        if (pageSettings) {
            let params = new URLSearchParams();
            for (let key in pageSettings) {
                params.set(key, pageSettings[key])
            }
            queryString = queryString ? queryString + '&' + params.toString() : params.toString();

        }
        return this.http.get<Page>(`${this.resourceUrl}?${queryString}`).toPromise();
    }

    /**
     * 
     * @param id Busca um formulário com as questões
     */
    findById(id: number): Promise<DynamicForm> {
        if (id) {
            return this.http.get<DynamicForm>(`${this.resourceUrl}/${id}`).toPromise();
        }
    }

    create(dynamicForm): Promise<DynamicForm> {
        var headers = new HttpHeaders()
            .append('Content-Type', "application/json");
        if (dynamicForm) {
            return this.http.post<DynamicForm>(this.resourceUrl, dynamicForm, { headers }).toPromise();
        }
    }

    update(dynamicForm): Promise<DynamicForm> {
        var headers = new HttpHeaders()
            .append('Content-Type', "application/json");
        if (dynamicForm) {
            return this.http.put<DynamicForm>(`${this.resourceUrl}/${dynamicForm.id}`, dynamicForm, { headers }).toPromise();
        }
    }

    delete(dynamicFormId): Promise<void> {
        if (dynamicFormId) {
            return this.http.delete<void>(`${this.resourceUrl}/${dynamicFormId}`).toPromise();
        }
    }

    createDynamicFormQuestion(dynamicFormQuestion, dynamicFormId): Promise<DynamicFormQuestion> {
        if (dynamicFormQuestion) {
            return this.http.post<DynamicFormQuestion>(`${this.resourceUrl}/${dynamicFormId}/question`, dynamicFormQuestion).toPromise();
        }
    }

    updateDynamicFormQuestion(dynamicFormQuestion): Promise<DynamicFormQuestion> {
        if (dynamicFormQuestion) {
            return this.http.put<DynamicFormQuestion>(`${this.resourceUrl}/question/${dynamicFormQuestion.id}`, dynamicFormQuestion).toPromise();
        }
    }

    deleteDynamicFormQuestion(dynamicFormQuestionId): Promise<void> {
        if (dynamicFormQuestionId) {
            return this.http.delete<void>(`${this.resourceUrl}/question/${dynamicFormQuestionId}`).toPromise();
        }
    }

}