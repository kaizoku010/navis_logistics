import * as React from 'react';
import Box from '@mui/joy/Box';
import Button from '@mui/joy/Button';
// Comment out unused imports
// import ListDivider from '@mui/joy/ListDivider';
import {Input} from '@mui/joy';
// import FormControl from '@mui/joy/FormControl';
// import FormLabel from '@mui/joy/FormLabel';

export default function Search() {
  // Comment out unused variables
  // const [radius, setRadius] = React.useState(13);
  // const [childHeight, setChildHeight] = React.useState(28);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Input
      className='input_search'
        size="md"
        placeholder="search"
        endDecorator={
          <Button variant="soft" size="sm">
            Search
          </Button>
        }
        sx={{
          '--Input-radius': `13px`,
          '--Input-decoratorChildHeight': `28px`,
        }}
      />
  
    </Box>
  );
}