import styled from 'styled-components';

export const LayoutWrapper = styled.div`
	width: 100%;
	min-height: 100vh;
	background-color: ${({ theme }) => theme.surface.background};
`;
