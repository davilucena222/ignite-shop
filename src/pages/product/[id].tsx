import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";
import Stripe from "stripe";
import { CartContext } from "../../contexts/CartContext";
import { stripe } from "../../lib/stripe";
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product";

interface Product {
  id: string;
  name: string;
  imageUrl: string;
  price: string;
  numberPrice: number;
  description: string;
  defaultPriceId: string;
}

interface ProductProps {
  product: Product;
}

export default function Product({ product }: ProductProps) {
  const { isFallback } = useRouter();

  const { addingProductToCart, checkIfProductAlreadyExistsInTheCart } = useContext(CartContext);

  const itemAlreadyAddedToTheCart = checkIfProductAlreadyExistsInTheCart(product.id);

  if (isFallback) {
    return <p>Loading...</p>
  }

  return (  
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>

      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} width={520} height={480} alt="" />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>

          <span>{product.price}</span>

          <p>{product.description}</p>
        
          <button disabled={itemAlreadyAddedToTheCart} onClick={() => addingProductToCart(product)}>
            {itemAlreadyAddedToTheCart ? "Produto já está no carrinho" : "Colocar na sacola"}
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'prod_N3l8ipREerKPhw' } }
    ],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price'],
  });

  const price = product.default_price as Stripe.Price;

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency', 
          currency: 'BRL',
        }).format(Number(price.unit_amount) / 100),
        numberPrice: price.unit_amount / 100,
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1, // 1 hour
  }
}