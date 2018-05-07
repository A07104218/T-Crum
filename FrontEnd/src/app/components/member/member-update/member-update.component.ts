import { Component, OnInit } from '@angular/core';
import { CrudService } from '../../../services/crud.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from '../../../models/user.model';
import { ErrorHandlerService } from '../../../services/error-handler.service';
import { DataService } from '../../../services/data.service';
import { User_image } from '../../../models/user_image';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-member-update',
    templateUrl: './member-update.component.html',
    styleUrls: ['./member-update.component.css']
})

export class MemberUpdateComponent implements OnInit {
    message: string;
    user_image: User_image;
    selected: string;
    passwordConfirmation: string;
    user: User;

    constructor(private crud: CrudService, private route: ActivatedRoute, private router: Router, private errorHandler: ErrorHandlerService, private data: DataService, private auth: AuthService) { }

    ngOnInit() {
        this.selected = '';
        this.user = new User('', '', '', '', '', null, null);

        this.crud.retrieve(this.crud.models.USER, this.auth.getUser().id)
            .subscribe(
                (res: User) => {
                    this.user = res;
                    this.user.password = '';

                    this.data.retrive(res.id)
                        .subscribe(
                            (resp: User_image) => {
                                this.selected = resp.path;
                            },
                            (err: HttpErrorResponse) => {
                                this.errorHandler.handleError(err);
                            }
                        )
                },
                (err: HttpErrorResponse) => {
                    this.errorHandler.handleError(err);
                }
            )
    }

    updateUser() {
        if (this.validateNonEmptyFields()) {
            this.crud.update(this.crud.models.USER, this.user.id, this.user)
                .subscribe(
                    (res: User) => {
                        console.log(res);
                        this.errorHandler.showInformativeMessage("Información actualizada.");
                        this.user_image = new User_image(this.user.id, this.selected);
                        
                        if(this.user_image.path != this.selected){
                            console.log("Image changed.");
                            this.data.update(this.user.id, this.selected)
                            .subscribe(
                                (resp: User_image) => {
                                    this.errorHandler.showInformativeMessage("Avatar actualizado.");
                                },
                                (err: HttpErrorResponse) => {
                                    console.log("Image");
                                    console.log(err);
                                    this.errorHandler.handleError(err);
                                }
                            )
                        }
                    },
                    (err: HttpErrorResponse) => {
                        console.log(err);
                        this.errorHandler.handleError(err);
                    }
                )
        }
        return false;
    }

    validateNonEmptyFields() {
        if (!this.user.id || !this.user.name || !this.user.department_major) {
            this.errorHandler.showInformativeMessage('Debes introducir tu matrícula, nombre, carrera o departamento, contraseña y la confirmación de la misma.');
            return false;
        }
        else {
            return true;
        }
    }

    areEqualPasswords() {
        if (this.user.password == this.passwordConfirmation) {
            return true;
        }
        else {
            return false;
        }
    }

    selectImage(number: string) {
        this.selected = number;
    }
}

