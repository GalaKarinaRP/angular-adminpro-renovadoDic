import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import Swal from 'sweetalert2';
import { delay } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';

import { HospitalService } from '../../../services/hospital.service';
import { Hospital } from '../../../models/hospital.model';
import { MedicoService } from '../../../services/medico.service';
import { Medico } from 'src/app/models/medico.model';

@Component({
  selector: 'app-medico',
  templateUrl: './medico.component.html',
  styles: [
  ]
})
export class MedicoComponent implements OnInit {

  public medicoForm : FormGroup;
  public hospitales: Hospital[] = [];
  public hospitalSeleccionado: Hospital;
  public medicoSeleccionado : Medico;

  constructor( private fb: FormBuilder,
               private hospitalService: HospitalService,
               private medicoService: MedicoService,
               private router: Router,
               private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {

    this.activatedRoute.params
    .subscribe( ({id}) => this.cargarMedico(id));   

    this.cargarHospitales();

    this.medicoForm = this.fb.group({
      nombre: ['', Validators.required],
      hospital: ['', Validators.required]
    });

    this.medicoForm.get('hospital').valueChanges
    .subscribe(hospitalId => {
      this.hospitalSeleccionado = this.hospitales.find( hospital => hospital._id === hospitalId);
      console.log(this.hospitalSeleccionado);
      
    });

  }


  cargarMedico(id: string): void {

    if( id === 'nuevo'){
      return;
    }
    this.medicoService.obtenerMedicoById( id )
      .pipe(
        delay(100)
      )
      .subscribe( medico => {     

        if( !medico ){
          return this.router.navigateByUrl(`/dashboard/medicos`);
        }
      const { nombre , hospital:{ _id }} = medico;
      this.medicoSeleccionado = medico;
      this.medicoForm.setValue({nombre, hospital:_id});
      });
  }

  cargarHospitales(){
    this.hospitalService.cargarHospitales()
        .subscribe( (hospitales : Hospital[]) => {
         this.hospitales = hospitales;
  });


  }

  guardarMedico(){

    const { nombre } = this.medicoForm.value;

    if( this.medicoSeleccionado ){
      //actualizar
      const data = {
        ...this.medicoForm.value,
        _id : this.medicoSeleccionado._id
      };

      this.medicoService.actualizarMedico( data )
        .subscribe( resp => {
          console.log(resp);
          
            Swal.fire('Actualizado', `${ nombre } creado correctamente`,'success');
        });

    }else{
      //crear
    
    this.medicoService.crearMedico(this.medicoForm.value)
    .subscribe( (resp : any)  => {
      Swal.fire(
        'Creado', `${nombre} creado correctamente`,'success'
      );
      this.router.navigateByUrl(`/dashboard/medico/${resp.medico._id}`);
      
    });
    }
    
    
  }

}
