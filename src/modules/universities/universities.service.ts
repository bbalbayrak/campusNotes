import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UNIVERSITY_REPOSITORY } from 'src/config/constants';
import { University } from './universities.entity';
import { UniDto } from './dto/uni.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    @Inject(UNIVERSITY_REPOSITORY)
    private readonly universityRepository: typeof University,
  ) {}

  //ADMIN
  async createUniversity(uniDto: UniDto): Promise<University> {
    const newUni = await this.universityRepository.create<University>(uniDto);
    return newUni;
  }

  async getAllUniversities(): Promise<University[]> {
    return this.universityRepository.findAll<University>();
  }

  async getUniversityById(id: number): Promise<University> {
    return this.universityRepository.findByPk(id);
  }

  //ADMIN
  async updateUniversity(
    id: number,
    uniDto: UniDto,
  ): Promise<University | null> {
    const existingUni = await this.universityRepository.findOne({
      where: { id: id },
    });

    if (!existingUni) {
      throw new NotFoundException(`University with ID ${id} not found.`);
    }
    await this.universityRepository.update(uniDto, {
      where: { id: id },
    });
    return this.universityRepository.findByPk(id);
  }

  //DELETE
  async deleteUniversity(id: number): Promise<void> {
    const deleted = await this.universityRepository.destroy({
      where: { id: id },
    });
    if (deleted === 0) {
      throw new NotFoundException(`University with ID ${id} not found.`);
    }
    return;
  }

  //uniDepartments relation can be added later

  //uni followers can be added later
}
