import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import useProducts from "@/hooks/useProducts";

const ProductsTable = () => {

    const { products } = useProducts();

    if ( !products.length ) return;

    return (
        <div className='p-2 border'>
            <Table>
                <TableCaption>Productos</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Descripción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        products.slice(0, 80)
                        .map(
                            (product) => (
                                <TableRow key={product.id}>
                                    <TableCell>{product.code}</TableCell>
                                    <TableCell>{product.name}</TableCell>
                                </TableRow>
                            )
                        )
                    }
                </TableBody>
            </Table>
        </div>
    );
};

export default ProductsTable;