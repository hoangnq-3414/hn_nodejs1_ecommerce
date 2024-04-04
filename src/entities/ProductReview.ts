import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Product } from './Product';
import { ClassicEntity } from '../base/BaseEntity';

@Entity('product_review')
export class ProductReview extends ClassicEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @Column()
  rating: number;

  @ManyToOne(() => User, (user) => user.productReviews)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Product, (product) => product.productReviews)
  @JoinColumn()
  product: Product;
}
